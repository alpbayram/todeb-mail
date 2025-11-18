const nodemailer = require('nodemailer');

// -------------------------
// Yardımcı: SMTP transporter
// -------------------------
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// -------------------------
// Yardımcı: HTML template seçici
// (ileride meta.id'ye göre switch ekleyebilirsin)
// -------------------------
function renderTemplate({ meta, added, removed, changed }) {
  // Şimdilik tek template, meta.id ile case açmaya hazır
  return renderDefaultTemplate({ meta, added, removed, changed });
}

// Basit yardımcı: liste section'ı
function renderListSection(title, items, renderItemHtml) {
  if (!items || items.length === 0) {
    return `
      <h3 style="margin:16px 0 4px 0;font-size:16px;color:#111827;">${title}</h3>
      <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">Kayıt bulunamadı.</p>
    `;
  }

  return `
    <h3 style="margin:16px 0 4px 0;font-size:16px;color:#111827;">${title} (${items.length})</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:8px;">
      <tbody>
        ${items.map(renderItemHtml).join('')}
      </tbody>
    </table>
  `;
}

// Default / TCMB template
function renderDefaultTemplate({ meta, added, removed, changed }) {
  const title = meta?.name || 'WebWatcher Güncelleme Raporu';
  const uri = meta?.uri || '';

  const addedHtml = renderListSection('Yeni Eklenenler', added, item => `
    <tr>
      <td style="border:1px solid #e5e7eb;padding:6px 8px;font-size:13px;">
        <strong>${item.kurulus_kodu}</strong>
      </td>
      <td style="border:1px solid #e5e7eb;padding:6px 8px;font-size:13px;">
        ${item.kurulus_adi}
      </td>
    </tr>
  `);

  const removedHtml = renderListSection('Silinenler', removed, item => `
    <tr>
      <td style="border:1px solid #fee2e2;padding:6px 8px;font-size:13px;color:#991b1b;">
        <strong>${item.kurulus_kodu}</strong>
      </td>
      <td style="border:1px solid #fee2e2;padding:6px 8px;font-size:13px;color:#991b1b;">
        ${item.kurulus_adi}
      </td>
    </tr>
  `);

  const changedHtml = renderListSection('Değişenler', changed, item => `
    <tr>
      <td style="border:1px solid #e5e7eb;padding:6px 8px;font-size:13px;vertical-align:top;">
        <strong>${item.kurulus_kodu}</strong>
      </td>
      <td style="border:1px solid #e5e7eb;padding:6px 8px;font-size:13px;vertical-align:top;">
        <div>
          <div style="font-size:13px;"><strong>Eski Ad:</strong> ${item.kurulus_adi_eski || '-'}</div>
          <div style="font-size:13px;"><strong>Yeni Ad:</strong> ${item.kurulus_adi}</div>
          <div style="font-size:13px;margin-top:4px;">
            <strong>Eski Yetkiler:</strong> ${(item.yetkiler_eski || []).join(', ') || '-'}
          </div>
          <div style="font-size:13px;">
            <strong>Yeni Yetkiler:</strong> ${(item.yetkiler || []).join(', ') || '-'}
          </div>
        </div>
      </td>
    </tr>
  `);

  const today = new Date().toLocaleDateString('tr-TR');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:16px 8px;">
          <table width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
            <!-- Header -->
            <tr>
              <td style="padding:16px 20px 12px 20px;background-color:#111827;color:#f9fafb;">
                <h1 style="margin:0;font-size:18px;">${title}</h1>
                ${uri ? `<p style="margin:4px 0 0 0;font-size:12px;">
                  <a href="${uri}" style="color:#93c5fd;text-decoration:none;">Sayfayı açmak için tıklayın</a>
                </p>` : ''}
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:16px 20px 20px 20px;font-size:14px;color:#111827;">
                ${addedHtml}
                ${removedHtml}
                ${changedHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:10px 16px;background-color:#f9fafb;font-size:11px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;">
                Distil.io / WebWatcher Otomatik Bildirim • ${today}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

// -------------------------
// Ana handler
// -------------------------
module.exports = async (context) => {
  const { req, res, log, error } = context;

  try {
    log('Mail function started');

    const rawBody = req.body || {};
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

    const to = body.to || process.env.SMTP_TO || process.env.SMTP_FROM;
    const subject = body.subject || 'WebWatcher Güncelleme Raporu';

    const meta = body.meta || {};
    const added = body.added || [];
    const removed = body.removed || [];
    const changed = body.changed || [];

    const html = renderTemplate({ meta, added, removed, changed });

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });

    log('Mail sent successfully');

    return res.json({ ok: true, message: 'Mail gönderildi' }, 200);
  } catch (err) {
    if (error) {
      error(err);
    } else {
      console.error(err);
    }
    return res.json({ ok: false, error: err.message }, 500);
  }
};
