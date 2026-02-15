# UtsavNest - Premium Farmhouse Booking Platform

UtsavNest is a full-stack, state-of-the-art property booking ecosystem designed for luxury farmhouse rentals. It features a triple-layered architecture (Admin, Vendor, and User) with seamless payment integration, real-time notifications, and premium design aesthetics.

## 🚀 Repository Structure

The project is organized as a monorepo containing four main components:

- **`backend/`**: Express.js server with MongoDB (Mongoose), handling authentication, payments, and business logic.
- **`frontend-users/`**: Customer-facing portal for searching and booking farmhouses.
- **`frontend-vendors/`**: Management dashboard for property owners to list and manage bookings.
- **`frontend-admin/`**: Internal dashboard for platform moderation, analytics, and payouts.

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js, Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs, Google OAuth 2.0
- **Payments**: Razorpay (Authorized & Manual Capture)
- **Storage**: Cloudinary (via Multer)
- **Communication**: Nodemailer, Node-cron

### Frontend (User, Vendor, Admin)
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Handling**: Date-fns, React Datepicker
- **Notifications**: React Toastify

## ✨ Key Features

### For Users
- **Premium Discovery**: Search farmhouses with city-based filtering.
- **Detailed Listings**: High-quality image galleries, amenity breakdowns, and property rules.
- **Smart Booking**: 30% advance payment via Razorpay, with the remaining 70% payable at the venue.
- **Refund Policy**: Automated calculation of refunds (100% for 48h+, 30% for 24-48h).
- **Wishlists & Reviews**: Save favorites and leave detailed verified reviews.

### For Vendors
- **Property Management**: List farmhouses with image uploads and availability calendars.
- **Booking Workflow**: Accept or reject booking requests before payment capture.
- **Dashboard**: Track earnings, view upcoming trips, and manage KYC/Bank details.
- **Verification**: Dedicated KYC submission flow for admin approval.

### For Admin
- **Full Moderation**: Approve/Reject vendors and property listings.
- **Analytics**: Real-time insights into bookings, users, and earnings.
- **Payout Management**: Manual payout tracking for vendor earnings.
- **Reports**: Exportable reports (CSV) for users, vendors, and transactions.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Google Cloud Console project (for Auth)

### Backend Setup
1. Navigate to `backend/`
2. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URL=your_mongodb_url
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
3. Run `npm install`
4. Start with `npm start` (uses nodemon)

### Frontend Setup
1. Navigate to any frontend directory (e.g., `frontend-users/`)
2. Create a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
3. Run `npm install`
4. Start with `npm run dev`

## ⚖️ Cancellation Policy
- **48+ Hours**: 100% refund of advance payment.
- **24-48 Hours**: 30% refund of advance payment (70% remains with the vendor).
- **<24 Hours**: Non-refundable.

---

Designed with ❤️ for premium travel experiences.
