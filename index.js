const nodemailer = require("nodemailer");

module.exports = async function (req, res) {
	try {
		// Webhook'tan gelen JSON
		const payload = req.body || {};

		// Env'den SMTP bilgilerini oku
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST, // proxy.uzmanposta.com
			port: Number(process.env.SMTP_PORT || 587), // 587
			auth: {
				user: process.env.SMTP_USER, // epostaadresi@todeb.org.tr
				pass: process.env.SMTP_PASS, // mail şifren
			},
		});

		// Test için sabit bir alıcıya mail at (sonra dinamik yaparsın)
		await transporter.sendMail({
			from: process.env.SMTP_FROM, // from: senin mail adresin
			to: "alp.bayram@todeb.org.tr", // şimdilik test için
			subject: "Webhook mail testi",
			text: JSON.stringify(payload, null, 2), // Gövdeye gelen JSON'u yaz
		});

		return res.json({ ok: true, message: "Mail gönderildi" });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
};
