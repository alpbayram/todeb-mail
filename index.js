const nodemailer = require("nodemailer");

module.exports = async function (req, res) {
	try {
		// Şimdilik payload kullanmıyoruz, sadece mail testi yapalım
		// İleride req.body'den JSON okuyup buraya koyarız.

		// Env'den SMTP bilgilerini oku
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST, // proxy.uzmanposta.com
			port: Number(process.env.SMTP_PORT || 587), // 587
			
			auth: {
				user: process.env.SMTP_USER, // epostaadresi@todeb.org.tr
				pass: process.env.SMTP_PASS, // şifre
			},
		});

		await transporter.sendMail({
			from: process.env.SMTP_FROM, // Gönderen
			to: process.env.SMTP_TO || process.env.SMTP_FROM, // Test için kendine
			subject: "Appwrite mail testi",
			text: "Bu mail Appwrite Function + Nodemailer ile gönderildi.",
		});

		return res.json({ ok: true, message: "Mail gönderildi" });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
};

