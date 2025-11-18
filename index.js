const nodemailer = require('nodemailer');

// -------------------------
// SMTP transporter
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
// Yardımcı: Satır üreticileri
// -------------------------

function buildAddedRows(added) {
  if (!added || added.length === 0) {
    return `
      <tr>
        <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
          Kayıt bulunamadı.
        </td>
      </tr>
    `;
  }

  return added
    .map(item => {
      const yetkiler = (item.yetkiler || []).join(', ') || '-';
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${item.kurulus_kodu}
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${item.kurulus_adi}
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${yetkiler}
          </td>
        </tr>
      `;
    })
    .join('');
}

function buildRemovedRows(removed) {
  if (!removed || removed.length === 0) {
    return `
      <tr>
        <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
          Kayıt bulunamadı.
        </td>
      </tr>
    `;
  }

  return removed
    .map(item => {
      const yetkiler = (item.yetkiler || []).join(', ') || '-';
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${item.kurulus_kodu}
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${item.kurulus_adi}
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;">
            ${yetkiler}
          </td>
        </tr>
      `;
    })
    .join('');
}

function buildChangedRows(changed) {
  if (!changed || changed.length === 0) {
    return `
      <tr>
        <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
          Kayıt bulunamadı.
        </td>
      </tr>
    `;
  }

  return changed
    .map(item => {
      const eskiYetkiler = (item.yetkiler_eski || []).join(', ') || '-';
      const yeniYetkiler = (item.yetkiler || []).join(', ') || '-';

      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
            ${item.kurulus_kodu}
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
            <div><strong>Önceki:</strong> ${item.kurulus_adi_eski || '-'}</div>
            <div style="margin-top:4px;"><strong>Yeni:</strong> ${item.kurulus_adi}</div>
          </td>
          <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
            <div><strong>Önceki:</strong> ${eskiYetkiler}</div>
            <div style="margin-top:4px;"><strong>Yeni:</strong> ${yeniYetkiler}</div>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="height:8px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      `;
    })
    .join('');
}

// -------------------------
// Template Router
// -------------------------
//
// Buraya Distill ID'lerine göre template seçimini koyacaksın.
// Şimdilik tek template var: renderTcmbTemplate
//
function renderTemplate(payload) {
  const meta = payload.meta || {};
  const id = meta.id;

  switch (id) {
    // ÖRNEK:
    // case "e3bc3dd2-c44d-11f0-b1ac-73f035e7ef88":
    //   return renderTcmbTemplate(payload);

    // Yeni site/template geldiğinde:
    // case "BAŞKA_DISTILL_ID":
    //   return renderBaskaTemplate(payload);

    default:
      // Şimdilik tüm siteler için ana template
      return renderTcmbTemplate(payload);
  }
}

// -------------------------
// TCMB / Default Template
// -------------------------
function renderTcmbTemplate({ meta, added, removed, changed }) {
  const today = new Date().toLocaleDateString('tr-TR');

  const addedRows = buildAddedRows(added);
  const removedRows = buildRemovedRows(removed);
  const changedRows = buildChangedRows(changed);

  const metaName = meta?.name || '';
  const metaUri = meta?.uri || '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yeni Değişiklikler</title>
  </head>
  <body
    style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;"
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color:#ffffff;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:600px;max-width:600px;border:2px solid #b0b0b0;background-color:#ffffff;"
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="background-color:#d4d4d4;padding:16px 0 12px 0;"
              >
                <img
                  src="https://raw.githubusercontent.com/alpbayram/todeb-mail/refs/heads/main/TODEB_Logo.png"
                  alt="TODEB Logo"
                  width="280"
                  height="auto"
                  style="display:block;border:none;outline:none;text-decoration:none;"
                />
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="background-color:#d4d4d4;padding:8px 24px 12px 24px;"
              >
                <h1
                  style="margin:0;font-size:24px;font-weight:bold;color:#000000;"
                >
                  Yeni Değişiklikler
                </h1>
                <p
                  style="margin:8px 0 0 0;font-size:14px;color:#333333;font-weight:bold;"
                >
                  Son güncellemeler aşağıda listelenmiştir.
                </p>
                ${
                  metaName
                    ? `<p style="margin:6px 0 0 0;font-size:13px;color:#111111;">
                        ${metaName}
                      </p>`
                    : ''
                }
                ${
                  metaUri
                    ? `<p style="margin:4px 0 0 0;font-size:12px;">
                        <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                          Siteye gitmek için tıklayınız
                        </a>
                      </p>`
                    : ''
                }
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;"
                    >
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;"
                    >
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="border-collapse:collapse;"
                      >
                        <thead>
                          <tr>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Kodu
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Adı
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${addedRows}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SİLİNENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;"
                    >
                      Silinenler
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;"
                    >
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="border-collapse:collapse;"
                      >
                        <thead>
                          <tr>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Kodu
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Adı
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${removedRows}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- DEĞİŞENLER -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;"
                    >
                      Değişenler
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;"
                    >
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="border-collapse:collapse;"
                      >
                        <thead>
                          <tr>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Kodu
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Kuruluş Adı
                            </th>
                            <th
                              align="left"
                              style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#f5f5f5;"
                            >
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${changedRows}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#666666;"
              >
                WebWatcher Otomatik Bildirim • ${today}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
    if (error) error(err);
    return res.json({ ok: false, error: err.message }, 500);
  }
};
