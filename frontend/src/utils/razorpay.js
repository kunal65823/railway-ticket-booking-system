// src/utils/razorpay.js
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Initialize Razorpay checkout
 * @param {Object} bookingData - Booking details (trainId, passengers, etc.)
 * @returns {Promise<Object>} - Booking confirmation response
 */
export const initializeRazorpayPayment = async (bookingData) => {
  try {
    // Step 1: Create order from backend
    const orderResponse = await paymentAPI.createOrder(bookingData);

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create payment order');
    }

    const { orderId, amount, key, bookingData: enrichedBookingData } = orderResponse;

    // Step 2: Open Razorpay checkout
    return new Promise((resolve, reject) => {
      const options = {
        key, // Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        order_id: orderId,
        name: 'RailAxis',
        description: `Train Booking - ${bookingData.trainId}`,
        image: 'https://via.placeholder.com/150', // Your logo URL
        prefill: {
          name: 'Passenger Name',
          email: 'passenger@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#6366f1', // Indigo color from your theme
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment window closed'));
          },
        },
        handler: async (response) => {
          try {
            // Step 3: Verify payment with backend
            const verifyResponse = await paymentAPI.verifyPayment({
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingData: enrichedBookingData,
            });

            if (verifyResponse.success) {
              toast.success('Payment successful! Your ticket is confirmed 🎉');
              resolve(verifyResponse.booking);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
            reject(err);
          }
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed: ' + response.error.reason);
        reject(new Error(response.error.reason));
      });
      rzp.open();
    });
  } catch (err) {
    toast.error(err.message || 'Payment initialization failed');
    throw err;
  }
};

/**
 * Load Razorpay script
 * @returns {Promise<boolean>} - True if script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      toast.error('Failed to load Razorpay');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
