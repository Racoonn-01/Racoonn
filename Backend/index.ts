import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5005);

app.use(cors());
app.use(express.json());

interface OtpRecord {
    code: string;
    expiresAt: number;
    lastSentAt: number;
    attempts: number;
}

interface RequestLimitRecord {
    count: number;
    firstRequestTime: number;
}

const otpStore = new Map<string, OtpRecord>();
const requestLimits = new Map<string, RequestLimitRecord>();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Racoonn Backend is running!' });
});

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials are not configured');
    }

    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

app.post('/api/payments/razorpay/order', async (req, res) => {
    try {
        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'A valid payment amount is required.' });
        }

        const order = await getRazorpayClient().orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcn_${Date.now()}`,
            notes: {
                bookingType: String(req.body.bookingType || 'stay'),
                bookingId: String(req.body.bookingId || ''),
            },
        });

        return res.status(201).json({ order });
    } catch (error) {
        console.error('Failed to create Razorpay order:', error);
        return res.status(500).json({ error: 'Unable to start the payment.' });
    }
});

app.post('/api/payments/razorpay/verify', (req, res) => {
    try {
        const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

        if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_SECRET) {
            return res.status(400).json({ error: 'Payment verification details are missing.' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');
        const signatureBuffer = Buffer.from(String(signature), 'utf8');
        const isValid = expectedSignatureBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(
            expectedSignatureBuffer,
            signatureBuffer
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Payment signature verification failed.' });
        }

        return res.json({ verified: true, paymentId, orderId });
    } catch (error) {
        console.error('Failed to verify Razorpay payment:', error);
        return res.status(500).json({ error: 'Unable to verify the payment.' });
    }
});

app.post('/api/otp/send', async (req, res) => {
    try {
        const { method, identifier } = req.body;
        if (!method || !identifier) {
            return res.status(400).json({ error: 'Method and identifier required' });
        }

        const now = Date.now();

        // 1. Rate Limit: Check resend cooldown (60 seconds)
        const existingOtp = otpStore.get(identifier);
        if (existingOtp && (now - existingOtp.lastSentAt) < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (now - existingOtp.lastSentAt)) / 1000);
            return res.status(429).json({ 
                error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` 
            });
        }

        // 2. Rate Limit: Max requests per identifier window (5 requests per 15 mins)
        const limitWin = 15 * 60 * 1000;
        const userLimit = requestLimits.get(identifier) || { count: 0, firstRequestTime: now };
        if (now - userLimit.firstRequestTime > limitWin) {
            userLimit.count = 1;
            userLimit.firstRequestTime = now;
        } else {
            userLimit.count += 1;
        }
        requestLimits.set(identifier, userLimit);

        if (userLimit.count > 5) {
            return res.status(429).json({ 
                error: 'Too many OTP requests. Please try again after 15 minutes.' 
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 5 min validity, reset attempt counter
        otpStore.set(identifier, {
            code: otp,
            expiresAt: now + 5 * 60 * 1000,
            lastSentAt: now,
            attempts: 0
        });

        if (method === 'email') {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: false,
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            const templatePath = path.join(__dirname, 'templates/emails/verification-code.html');
            let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
            htmlTemplate = htmlTemplate.replace('731924', otp);
            
            await transporter.sendMail({
                from: '"Racoonn" <support@racoonn.com>',
                to: identifier,
                subject: `Verify Your Email - ${otp}`,
                html: htmlTemplate,
            });
            console.log(`Email OTP ${otp} sent to ${identifier}`);
        } else {
            console.log(`Mock SMS OTP ${otp} sent to ${identifier}`);
        }

        res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/otp/verify', (req, res) => {
    const { identifier, code } = req.body;
    const stored = otpStore.get(identifier);

    if (!stored) {
        return res.status(400).json({ error: 'No OTP found or it has expired.' });
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check failed attempts limit (max 3 allowed)
    if (stored.attempts >= 3) {
        otpStore.delete(identifier);
        return res.status(429).json({ 
            error: 'Maximum verification attempts exceeded. Please request a new OTP.' 
        });
    }

    if (stored.code === code) {
        otpStore.delete(identifier);
        return res.json({ success: true, message: 'Verified successfully.' });
    } else {
        stored.attempts += 1;
        const remaining = 3 - stored.attempts;
        if (remaining <= 0) {
            otpStore.delete(identifier);
            return res.status(400).json({ 
                error: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.' 
            });
        }
        return res.status(400).json({ 
            error: `Invalid OTP code. ${remaining} attempt(s) remaining.` 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
