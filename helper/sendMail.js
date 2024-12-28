require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendMail = async (email, subject, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            to: email,
            subject: subject,
            html: `${verificationCode ? "Your verificationCode :" + verificationCode : "Successfully!!"}`,
        });
        console.log("Message sent: %s", info.messageId,  email, );
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendMail;
