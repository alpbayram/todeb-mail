const nodemailer = require('nodemailer');

module.exports = async (context) => {
  const { req, res, log, error } = context;

  try {
    log('Function started');

    // SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                // proxy.uzmanposta.com
      port: Number(process.env.SMTP_PORT || 587), // 587

      auth: {
        user: process.env.SMTP_USER,              // epostaadresi@todeb.org.tr
        pass: process.env.SMTP_PASS,              // şifre
      },
    });

    // İstersen buradan body alabilirsin:
    // const body = req.body || {};
    // şimdilik sabit bir test maili atalım
 await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to,
  subject,
  text, // hâlâ dursun, plain text fallback
  html: `
    <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;">
      <h2 style="color:#1e88e5;">Webhook Mail</h2>
      <p>${text}</p>
      <hr>
      <p style="font-size:12px;color:#888;">Bu e-posta Appwrite Function ve Nodemailer üzerinden gönderildi.</p>
    </div>
  `,
});


    // Başarılı cevap
    return res.json(
      { ok: true, message: 'Mail gönderildi' },
      200
    );
  } catch (err) {
    // Hata logla + cevap döndür
    error(err);
    return res.json(
      { ok: false, error: err.message },
      500
    );
  }
};



