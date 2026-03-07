const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// @route   GET /api/messages
// @desc    Get user conversations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { userId } = req.query;

    let filter = {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    };

    if (userId) {
      filter = {
        $or: [
          { sender: req.user._id, receiver: userId },
          { sender: userId, receiver: req.user._id }
        ]
      };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('accommodation', 'title type address')
      .sort('-createdAt')
      .limit(100);

    // Group messages by conversation
    const conversations = {};
    messages.forEach(msg => {
      const conversationId = getConversationId(
        msg.sender._id.toString(),
        msg.receiver._id.toString()
      );

      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          conversationId,
          participants: [
            msg.sender._id.toString() === req.user._id.toString()
              ? msg.receiver
              : msg.sender
          ],
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }

      conversations[conversationId].messages.push(msg);

      if (!conversations[conversationId].lastMessage ||
        msg.createdAt > conversations[conversationId].lastMessage.createdAt) {
        conversations[conversationId].lastMessage = msg;
      }

      if (!msg.isRead && msg.receiver._id.toString() === req.user._id.toString()) {
        conversations[conversationId].unreadCount++;
      }
    });

    // Convert to array and sort by last message time
    const conversationsArray = Object.values(conversations).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt - a.lastMessage.createdAt;
    });

    res.json({
      success: true,
      count: conversationsArray.length,
      data: conversationsArray
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('accommodation', 'title type address')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, [
  body('receiver').notEmpty().withMessage('Receiver ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('accommodation').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { receiver, content, accommodation } = req.body;

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const conversationId = getConversationId(req.user._id.toString(), receiver);

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver,
      content,
      accommodation
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('accommodation', 'title type address');

    // Create notification for receiver
    try {
      await Notification.create({
        recipient: receiver,
        sender: req.user._id,
        type: 'message',
        title: 'New Message',
        message: `${req.user.name} sent you a message`,
        link: `/messages?id=${conversationId}`,
        referenceId: message._id
      });
    } catch (notifError) {
      console.error('Failed to create message notification:', notifError);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

