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
 <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
  <!-- Üst kısım: Logo ve başlık -->
  <div style="background-color:#f9fafb;padding:24px 24px 16px 24px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <img
      src="https://fra.cloud.appwrite.io/v1/storage/buckets/690aedd20007ff371e3f/files/690aeddb0026f4902a30/view?project=6909b793000a48fd66d8&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbklkIjoiNjkwYWYxYjIyZGQ0ZjU2ZTI2ZjQiLCJyZXNvdXJjZUlkIjoiNjkwYWVkZDIwMDA3ZmYzNzFlM2Y6NjkwYWVkZGIwMDI2ZjQ5MDJhMzAiLCJyZXNvdXJjZVR5cGUiOiJmaWxlcyIsInJlc291cmNlSW50ZXJuYWxJZCI6IjQ3NjA2OjEiLCJpYXQiOjE3NjIzMjg3NDZ9.L_oz62JPx-luMjylXg4LF3z7EsLluQEZKZGqdRqWwP4"
      alt="Distil.io Logo"
      width="120"
      height="auto"
      style="display:block;margin:0 auto 12px auto;"
    />
    <h2 style="margin:0;font-size:20px;color:#111827;">Yeni Değişiklikler</h2>
    <p style="margin:8px 0 0;color:#1e40af;font-size:14px;">
      Son sürüm güncellemeleri aşağıda listelenmiştir.
    </p>
  </div>

  <!-- Yeni değişiklikler -->
  <div style="background-color:#f0f9ff;padding:20px 24px;border-bottom:1px solid #e5e7eb;">
    <h3 style="margin:0;color:#0c4a6e;font-size:16px;">Yeni</h3>
    <div style="background:#e0f2fe;border:1px solid #bae6fd;padding:12px;margin-top:8px;border-radius:6px;color:#0c4a6e;font-size:14px;">
      ${body.newChanges || "Yeni değişiklik metni burada yer alacak."}
    </div>
  </div>

  <!-- Eski hali -->
  <div style="background-color:#ffffff;padding:20px 24px;">
    <h3 style="margin:0;color:#374151;font-size:16px;">Önceki Hali</h3>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px;margin-top:8px;border-radius:6px;color:#4b5563;font-size:14px;">
      ${body.oldState || "Önceki hali burada yer alacak."}
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color:#f9fafb;text-align:center;padding:14px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Distil.io Otomatik Bildirim • ${new Date().toLocaleDateString("tr-TR")}
    </p>
  </div>
</div>

`;
        const html2 = `<!DOCTYPE html>
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
            style="width:600px;max-width:600px;border:1px solid #d4d4d4;background-color:#ffffff;"
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="background-color:#d4d4d4;padding:16px 0 12px 0;"
              >
                <img
                  src="https://raw.githubusercontent.com/alpbayram/todeb-mail/refs/heads/main/TODEB_Logo.png"
                  alt="Distil.io Logo"
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
                  Son sürüm güncellemeleri aşağıda listelenmiştir.
                </p>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Yeni Değişiklikler -->
            <tr>
              <td style="padding:16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;"
                    >
                      Yeni
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="border:1px solid #d4d4d4;padding:12px;font-size:14px;color:#405464;"
                    >
                      ${body.newChanges ||
                      "Yeni değişiklik metni burada yer alacak."}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Önceki Hali -->
            <tr>
              <td style="padding:16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;"
                    >
                      Önceki Hali
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="border:1px solid #d4d4d4;padding:12px;font-size:14px;color:#405464;"
                    >
                      ${body.oldState ||
                      "Önceki hali burada yer alacak."}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#666666;"
              >
                Distil.io Otomatik Bildirim •
                ${new Date().toLocaleDateString("tr-TR")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`;






        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject: 'Distil.io Bildirim - Yeni Güncellemeler',
            html: html2
        });


        return res.json({ ok: true, message: 'Mail gönderildi' }, 200);
    } catch (err) {
        error(err);
        return res.json({ ok: false, error: err.message }, 500);
    }
};












