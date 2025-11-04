const nodemailer = require('nodemailer');

module.exports = async (context) => {
  const { req, res, log, error } = context;

  try {
    log('Function started');

    // Webhook'tan gelen JSON
    const body = req.body || {};

    // JSON'dan gelecek alanlar (boşsa env'dekilere düşüyor)
    const to = body.to || process.env.SMTP_TO || process.env.SMTP_FROM;
    const subject = body.subject || 'Webhook mail';
    const text =
      body.message ||
      body.text ||
      JSON.stringify(body, null, 2);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });

    return res.json({ ok: true, message: 'Mail gönderildi' }, 200);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: err.message }, 500);
  }
};
