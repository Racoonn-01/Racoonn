import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

const otpStore = new Map();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Racoonn Backend is running!' });
});

app.post('/api/otp/send', async (req, res) => {
    try {
        const { method, identifier } = req.body;
        if (!method || !identifier) {
            return res.status(400).json({ error: 'Method and identifier required' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 1 min expiry
        otpStore.set(identifier, {
            code: otp,
            expiresAt: Date.now() + 1 * 60 * 1000
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
            
            // Format the code to add spaces between digits (e.g., "7 3 1 9 2 4")
            // Wait, the template has 731924 without spaces but with letter-spacing. Let's just replace 731924 with the code.
            htmlTemplate = htmlTemplate.replace('731924', otp);
            
            // Also need to read base64 logo if we want to inject it here.
            // But since the template ALREADY has the base64 injected from our earlier step, we don't need to do it again!
            
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

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/otp/verify', (req, res) => {
    const { identifier, code } = req.body;
    const stored = otpStore.get(identifier);

    if (!stored) {
        return res.status(400).json({ error: 'No OTP found or it expired.' });
    }
    
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ error: 'OTP has expired.' });
    }

    if (stored.code === code) {
        otpStore.delete(identifier);
        return res.json({ success: true, message: 'Verified' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP code.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
