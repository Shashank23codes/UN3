const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send email function
const sendEmail = async (options) => {
    const mailOptions = {
        from: `"UtsavNest" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', options.to);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Password reset email template
const sendPasswordResetEmail = async (email, resetToken, userType = 'user') => {
    const resetUrl = userType === 'vendor'
        ? `${process.env.VENDOR_FRONTEND_URL}/reset-password/${resetToken}`
        : `${process.env.USER_FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your UtsavNest account.</p>
                    <p>Click the button below to reset your password:</p>
                    <center>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </center>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #10b981;">${resetUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <div class="footer">
                        <p>© 2025 UtsavNest. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Password Reset Request - UtsavNest',
        html
    });
};

// Email verification template
const sendVerificationEmail = async (email, verificationToken, userType = 'user') => {
    const verifyUrl = userType === 'vendor'
        ? `${process.env.VENDOR_FRONTEND_URL}/verify-email/${verificationToken}`
        : `${process.env.USER_FRONTEND_URL}/verify-email/${verificationToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✉️ Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Welcome to UtsavNest!</p>
                    <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                    <center>
                        <a href="${verifyUrl}" class="button">Verify Email</a>
                    </center>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #10b981;">${verifyUrl}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <div class="footer">
                        <p>© 2025 UtsavNest. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Verify Your Email - UtsavNest',
        html
    });
};

// KYC Email Templates
const sendKYCEmail = async (email, name, kycFormUrl) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 Complete Your KYC Verification</h1>
                </div>
                <div class="content">
                    <p>Hi ${name},</p>
                    <p>Your Razorpay linked account has been created successfully! To start listing properties and receiving payments, please complete your KYC verification.</p>
                    <center>
                        <a href="${kycFormUrl}" class="button">Complete KYC Now</a>
                    </center>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #10b981;">${kycFormUrl}</p>
                    <p><strong>Why KYC is required:</strong></p>
                    <ul>
                        <li>Secure payment processing</li>
                        <li>Compliance with financial regulations</li>
                        <li>Protection for you and your guests</li>
                    </ul>
                    <p>This link will remain active. You can complete KYC at any time.</p>
                    <div class="footer">
                        <p>© 2025 UtsavNest. All rights reserved.</p>
                        <p>Need help? Contact support@utsavnest.com</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Complete Your KYC - Start Listing Properties',
        html
    });
};

const sendKYCStatusEmail = async (email, name, status, reason = '') => {
    let html = '';
    let subject = '';

    if (status === 'approved') {
        subject = '🎉 KYC Approved - Start Listing Properties!';
        html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 KYC Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p><strong>Congratulations!</strong> Your KYC has been approved by Razorpay.</p>
                        <p>You can now:</p>
                        <ul>
                            <li>✅ List properties on UtsavNest</li>
                            <li>✅ Receive payments directly to your bank account</li>
                            <li>✅ Start earning from bookings</li>
                        </ul>
                        <p>Your properties will now be visible to customers. Start managing your listings from your dashboard!</p>
                        <div class="footer">
                            <p>© 2025 UtsavNest. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    } else if (status === 'rejected') {
        subject = '❌ KYC Rejected - Action Required';
        html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ KYC Rejected</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Unfortunately, your KYC submission was rejected by Razorpay.</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                        <p>Please resubmit your KYC with correct information to start listing properties.</p>
                        <p>If you need help, please contact our support team at support@utsavnest.com</p>
                        <div class="footer">
                            <p>© 2025 UtsavNest. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    } else if (status === 'suspended') {
        subject = '⚠️ Account Suspended - Action Required';
        html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Account Suspended</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Your Razorpay account has been suspended. Your properties are no longer visible to customers.</p>
                        <p>Please contact support@utsavnest.com for more information.</p>
                        <div class="footer">
                            <p>© 2025 UtsavNest. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    return await sendEmail({
        to: email,
        subject,
        html
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendKYCEmail,
    sendKYCStatusEmail
};
