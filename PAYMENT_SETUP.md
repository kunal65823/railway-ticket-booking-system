# Razorpay Payment Integration Setup

## Overview
This project includes Razorpay payment gateway integration for secure ticket booking payments. Users must pay before their booking is confirmed.

## Current Test Credentials

### Backend (.env)
```
RAZORPAY_KEY_ID=rzp_test_1DP5MMOk78gTHU
RAZORPAY_KEY_SECRET=jBnfW0oW7zDJ8KhL4mP9qR2xT5vU8wY1
RAZORPAY_WEBHOOK_SECRET=whsec_test_123456789
```

### Frontend (.env)
```
REACT_APP_RAZORPAY_KEY=rzp_test_1DP5MMOk78gTHU
```

## Payment Flow

1. **Initiate Payment** - User clicks "Review & Pay"
   - Frontend sends booking details to backend
   - Backend creates Razorpay order (amount in paise)

2. **Razorpay Checkout** - Payment window opens
   - User enters card/payment details
   - Razorpay handles PCI compliance

3. **Verify Payment** - Backend verifies signature
   - Validates Razorpay signature
   - Creates confirmed booking in database
   - Updates seat availability
   - Generates QR code

4. **Confirmation** - User sees booking details
   - PNR number displayed
   - Payment status shown
   - QR code available

## API Endpoints

### Create Order
```
POST /api/payment/create-order
Headers: Authorization: Bearer {token}
Body: { bookingData: {...} }
Response: { success, orderId, amount, key, bookingData }
```

### Verify Payment
```
POST /api/payment/verify
Headers: Authorization: Bearer {token}
Body: { orderId, paymentId, signature, bookingData }
Response: { success, message, booking }
```

### Webhook (Optional)
```
POST /api/payment/webhook
Body: Razorpay webhook payload
```

## File Structure

### Backend
- `controllers/paymentController.js` - Payment logic
- `routes/payment.js` - Payment endpoints
- `server.js` - Registered payment routes

### Frontend
- `utils/razorpay.js` - Razorpay utilities
- `services/api.js` - Payment API calls
- `pages/BookTicket.js` - Integrated checkout flow

## Setup Instructions

### 1. Get Razorpay Test Credentials
- Sign up at https://dashboard.razorpay.com
- Go to Settings > API Keys
- Copy Test Key ID and Secret

### 2. Update Environment Variables

**Backend (.env)**
```
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
```

**Frontend (.env)**
```
REACT_APP_RAZORPAY_KEY=your_test_key_id
```

### 3. Restart Services
```bash
# Backend
npm --prefix backend run dev

# Frontend
npm --prefix frontend start
```

## Testing

### Test Cards (Razorpay Sandbox)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

### Test Payment Flow
1. Go to http://localhost:3000
2. Search for trains
3. Click "Book Ticket"
4. Fill passenger details
5. Click "Review & Pay"
6. Enter test card details
7. Complete payment
8. See booking confirmation

## Production Setup

### 1. Get Live Credentials
- In Razorpay Dashboard: Settings > API Keys
- Switch to Live mode
- Copy Live Key ID and Secret

### 2. Update Production Environment
```
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 3. Update Frontend Configuration
- Change API base URL to production backend
- Update Razorpay key to live key

### 4. Enable Webhooks (Recommended)
- Razorpay Dashboard: Settings > Webhooks
- Add webhook URL: `https://your-domain.com/api/payment/webhook`
- Select events: `payment.authorized`, `payment.failed`

## Troubleshooting

### Error: "Failed to load Razorpay"
- Check browser console for script loading errors
- Verify internet connection
- Clear browser cache

### Error: "Payment verification failed"
- Ensure Razorpay keys match between frontend and backend
- Check that signature verification logic is correct
- Verify timestamps align

### Order Not Created
- Check backend logs
- Verify backend is running on correct port
- Validate CORS is enabled

### Seats Not Updated After Payment
- Check booking controller is updating seat availability
- Verify database transactions are atomic

## Security Notes

- Never commit `.env` files with real credentials
- Use environment variables in production
- Validate all payment data on backend
- Implement rate limiting on payment endpoints
- Use HTTPS in production
- Store payment IDs and transaction details securely

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
- API Reference: https://razorpay.com/api/

## Future Enhancements

- [ ] Webhook integration for automatic payment status updates
- [ ] Refund functionality
- [ ] Multiple payment methods
- [ ] Invoice generation
- [ ] Payment history tracking
- [ ] Email receipts
- [ ] Subscription/recurring payments
