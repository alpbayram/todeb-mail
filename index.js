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
const html = `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #f8fafc; padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0; color: #111827; font-size: 18px;">Yeni Değişiklikler</h2>
      <p style="margin: 10px 0 0; color: #1e40af; font-size: 14px;">
        Bu sürümde aşağıdaki güncellemeler yapıldı:
      </p>
      <div style="background-color: #e0f2fe; border: 1px solid #bae6fd; padding: 12px; margin-top: 12px; border-radius: 6px; font-size: 14px; color: #0c4a6e;">
        ${body.newChanges || "Yeni değişiklik metni burada yer alacak."}
      </div>
    </div>

    <div style="background-color: #ffffff; padding: 20px 24px;">
      <h2 style="margin: 0; color: #111827; font-size: 18px;">Önceki Hali</h2>
      <p style="margin: 10px 0 0; color: #4b5563; font-size: 14px;">
        Önceki versiyon içeriği:
      </p>
      <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; margin-top: 12px; border-radius: 6px; font-size: 14px; color: #374151;">
        ${body.oldState || "Önceki hali burada yer alacak."}
      </div>
    </div>

    <div style="background-color: #f9fafb; text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Distil.io Otomatik Bildirim • ${new Date().toLocaleDateString('tr-TR')}
      </p>
    </div>
  </div>
`;

    
 await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to,
  subject: 'Distil.io Bildirim - Yeni Güncellemeler',
  html,
});


    return res.json({ ok: true, message: 'Mail gönderildi' }, 200);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: err.message }, 500);
  }
};




