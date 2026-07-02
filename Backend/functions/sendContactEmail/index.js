/**
 * Cloud Function to send an email when a new ContactRequest is created.
 */

export default async ({ req, res, log, error }) => {
    log('sendContactEmail function triggered');

    try {
        // Appwrite triggers this function when a document in ContactRequests is created
        // The event data is available in the environment variables
        const eventData = process.env.APPWRITE_FUNCTION_EVENT_DATA;
        
        if (!eventData) {
            log('No event data found, returning');
            return res.json({ success: true, message: 'No event data' });
        }

        const request = JSON.parse(eventData);
        
        log(`New contact request from: ${request.name} (${request.email})`);
        
        // TODO:
        // 1. Initialize SMTP transporter (e.g. Nodemailer, Sendgrid)
        // 2. Send email to admin alerting them of a new contact request
        // 3. (Optional) Send auto-reply to the user

        log('Email sent successfully (mock)');

        return res.json({
            success: true,
            message: 'Notification email sent'
        });

    } catch (err) {
        error(err.message);
        return res.json({ success: false, message: 'Internal Server Error' }, 500);
    }
};
