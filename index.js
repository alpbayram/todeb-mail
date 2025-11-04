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
      from: process.env.SMTP_FROM,                         // kimden
      to: process.env.SMTP_TO || process.env.SMTP_FROM,    // test için kendine
      subject: 'Appwrite + Nodemailer test',
      text: 'Bu mail Appwrite Function kullanılarak gönderildi.',
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
