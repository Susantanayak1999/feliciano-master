# 🍽️ Feliciano — Restaurant Website

A modern restaurant website with menu, cart, and Razorpay payment integration.

## 📁 Structure

```
feliciano-master/
├── backend/          # Node.js + Express + Razorpay
└── feliciano-master/ # Frontend (HTML/CSS/JS)
```

## 🚀 Local Setup

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
PORT=5000
```

Start:
```bash
npm start
```

### Frontend
Open `feliciano-master/index.html` with Live Server.

## 💳 Test Payment

| Field | Value |
|-------|-------|
| Card | `4111 1111 1111 1111` |
| CVV | `123` |
| OTP | `1234` |
| UPI | `success@razorpay` |