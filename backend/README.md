# ShopKart — Customer Authentication Service

## Setup

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` — your local or Atlas MongoDB connection string
   - `JWT_SECRET` — any long random string (see the viva guide for how to generate one)
4. Start MongoDB locally (or use Atlas).
5. Run the server:
   ```
   npm run dev
   ```
   (or `npm start` if you don't have nodemon)

## Testing with Postman

1. **Register** — `POST http://localhost:3000/customers/register`
   Body (JSON): `{ "fullName": "John Doe", "email": "john@gmail.com", "password": "john123", "phone": "9876543210" }`

2. **Login** — `POST http://localhost:3000/customers/login`
   Body (JSON): `{ "email": "john@gmail.com", "password": "john123" }`
   In Postman, make sure "cookies" are enabled (they are, by default) so the `token` cookie gets saved and sent automatically on the next requests.

3. **Profile** — `GET http://localhost:3000/customers/me`
   No body needed — Postman will send the saved cookie automatically.

4. **Logout** — `POST http://localhost:3000/customers/logout`

5. **Change Password (bonus)** — `PATCH http://localhost:3000/customers/change-password`
   Body (JSON): `{ "oldPassword": "john123", "newPassword": "newpass456" }`

---

## Lab 06 — Checkout, Orders & Razorpay (Test Mode)

1. Add your **Test Mode** keys to `.env` (Razorpay Dashboard → Account & Settings → API Keys, with Test Mode on):
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```
   The secret stays on the backend only. Restart the server after editing `.env`.
2. `npm install` (pulls in the `razorpay` package), then `npm run dev`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/orders/create-payment-order` | Validate address + cart + stock, calculate total on the server, create a pending order and a Razorpay Order |
| POST | `/orders/verify-payment` | Verify the Razorpay HMAC signature, mark the order PAID/PLACED, clear the cart |
| POST | `/orders/payment-failed` | Mark a pending order FAILED (cart untouched) |
| GET | `/orders` | Current user's placed orders, newest first |
| GET | `/orders/:id` | One order (404 unless it belongs to you) |
| PATCH | `/orders/:id/status` | Bonus, development only: PLACED → CONFIRMED → SHIPPED → DELIVERED |
