import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const bookingId = searchParams.get('bookingId');
            // Cashfree appends order_id, but check both for resiliency
            const orderId = searchParams.get('order_id') || searchParams.get('orderId');
            const gateway = searchParams.get('gateway');

            if (!bookingId || !orderId) {
                console.error('❌ Missing callback parameters:', { bookingId, orderId, gateway });
                toast.error('Invalid payment callback parameters');
                navigate('/bookings');
                return;
            }

            try {
                const response = await axios.post(
                    `${API_URL}/bookings/${bookingId}/payment/cashfree/verify`,
                    { orderId },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.data.success) {
                    toast.success('Payment successful! Your booking is confirmed.');
                } else {
                    toast.error('Payment verification failed.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                toast.error(error.response?.data?.message || 'Failed to verify payment');
            } finally {
                navigate('/bookings');
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div className="loading">
                <div className="spinner"></div>
                <h2>Verifying your payment...</h2>
                <p>Please do not refresh the page or go back.</p>
            </div>
        </div>
    );
};

export default PaymentCallback;
