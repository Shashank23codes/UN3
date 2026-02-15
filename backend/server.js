require("dotenv").config();
// Server restart trigger
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// app level middleware
app.use(express.json());
app.use(cors());

// COOP/COEP headers for Google Auth
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

// routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/farmhouses', require('./routes/farmhouseRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/earnings', require('./routes/earningsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/razorpay-route', require('./routes/razorpayRouteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);

    // Initialize Cron Jobs
    const initCronJobs = require('./utils/cronJobs');
    initCronJobs();
});