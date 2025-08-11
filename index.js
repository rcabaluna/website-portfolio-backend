require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Gmail SMTP transporter using env vars
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS,
	},
});

// Middleware to check auth key in headers
const checkAuthKey = (req, res, next) => {
	const authKey = req.headers["x-auth-key"];
	if (!authKey || authKey !== process.env.AUTH_KEY) {
		return res
			.status(401)
			.json({ error: "Unauthorized: Invalid auth key" });
	}
	next();
};

// Use the middleware on /send endpoint
app.post("/send", checkAuthKey, async (req, res) => {
	const { name, email, message } = req.body;

	if (!name || !email || !message) {
		return res.status(400).json({ error: "Please fill all fields." });
	}

	const mailOptions = {
		from: email,
		to: process.env.GMAIL_USER,
		subject: `ruelcabaluna.dev: New message from your website.`,
		text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.json({ message: "Email sent successfully!" });
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({ error: "Failed to send email." });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
