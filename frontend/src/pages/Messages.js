import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import './Messages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { notifications, markAsRead } = useContext(NotificationContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setConversations(response.data.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${conversationId}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Refresh conversations every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Handle URL parameters for direct conversation access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('id');
    if (convId && conversations.length > 0) {
      const conv = conversations.find(c => c.conversationId === convId);
      if (conv) setSelectedConversation(conv);
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationId);

      // Cleanup: fetch conversations immediately to update sidebar unread counts
      fetchConversations();

      // Mark relevant unread notifications as read
      const relevantNotifs = notifications.filter(n =>
        !n.isRead &&
        n.type === 'message' &&
        (n.link === '/messages' || n.link.includes(selectedConversation.conversationId))
      );

      relevantNotifs.forEach(n => markAsRead(n._id));

      // Poll for new messages in current conversation
      const msgInterval = setInterval(() => {
        fetchMessages(selectedConversation.conversationId);
      }, 5000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedConversation, notifications, markAsRead, fetchMessages, fetchConversations]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const otherUser = selectedConversation.participants[0];
      await axios.post(`${API_URL}/messages`, {
        receiver: otherUser._id || otherUser.id,
        content: newMessage,
        accommodation: selectedConversation.messages[0]?.accommodation?._id
      });

      setNewMessage('');
      fetchMessages(selectedConversation.conversationId);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="container">
        <h1 className="page-title">Messages</h1>
        <div className="messages-container">
          <div className="conversations-sidebar">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  className={`conversation-item ${selectedConversation?.conversationId === conv.conversationId ? 'active' : ''
                    }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-info">
                    <h4>{conv.participants[0]?.name}</h4>
                    {conv.lastMessage && (
                      <p className="last-message">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="messages-main">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <h3>{selectedConversation.participants[0]?.name}</h3>
                </div>
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.sender._id === user?.id ? 'sent' : 'received'
                        }`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="message-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="btn btn-primary">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
