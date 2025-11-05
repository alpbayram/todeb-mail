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
      src="https://fra.cloud.appwrite.io/v1/storage/buckets/690aedd20007ff371e3f/files/690aeddb0026f4902a30/view?project=6909b793000a48fd66d8&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbklkIjoiNjkwYWYxYjIyZGQ0ZjU2ZTI2ZjQiLCJyZXNvdXJjZUlkIjoiNjkwYWVkZDIwMDA3ZmYzNzFlM2Y6NjkwYWVkZGIwMDI2ZjQ5MDJhMzAiLCJyZXNvdXJjZVR5cGUiOiJmaWxlcyIsInJlc291cmNlSW50ZXJuYWxJZCI6IjQ3NjA2OjEiLCJpYXQiOjE3NjIzMjUxNTV9.BNO6NdUIJNoITkkjnpkRUumMPBHD37nnv4JCzaXDU9Y"
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
        const html2 = `
    <div
      style='background-color:#ffffff;color:#405464;font-family:Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#ffffff;border-radius:0"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div
                style="padding:12px 0px 12px 0px;background-color:#D4D4D4;text-align:center"
              >
                <img
                  alt=""
                  src="https://fra.cloud.appwrite.io/v1/storage/buckets/690aedd20007ff371e3f/files/690aeddb0026f4902a30/view?project=6909b793000a48fd66d8&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbklkIjoiNjkwYWYxYjIyZGQ0ZjU2ZTI2ZjQiLCJyZXNvdXJjZUlkIjoiNjkwYWVkZDIwMDA3ZmYzNzFlM2Y6NjkwYWVkZGIwMDI2ZjQ5MDJhMzAiLCJyZXNvdXJjZVR5cGUiOiJmaWxlcyIsInJlc291cmNlSW50ZXJuYWxJZCI6IjQ3NjA2OjEiLCJpYXQiOjE3NjIzMjc1ODh9.cQjTwN7lwlu4yDyXwOaR6j0U1JT4g423hm3YCA05HqM"
                  height="96"
                  style="height:96px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h1
                style="background-color:#D4D4D4;font-weight:bold;text-align:center;margin:0;font-size:32px;padding:0px 24px 0px 24px"
              >
                Yeni Değişiklikler
              </h1>
              <div
                style="background-color:#D4D4D4;font-size:16px;font-weight:bold;text-align:center;padding:16px 24px 16px 24px"
              >
                Son sürüm güncellemeleri aşağıda listelenmiştir.
              </div>
              <div style="height:48px"></div>
              <div style="border-radius:0;padding:0px 0px 0px 0px">
                <div style="border:1px solid #d4d4d4;padding:0px 0px 0px 0px">
                  <div
                    style="font-size:24px;font-weight:bold;padding:0px 0px 0px 0px"
                  >
                    Yeni
                  </div>
                </div>
                <div
                  style="border:1px solid #d4d4d4;border-radius:0;padding:0px 0px 0px 24px"
                >
                  <div
                    style="font-size:18px;font-weight:normal;padding:16px 0px 16px 0px"
                  >
                     ${body.newChanges || "Yeni değişiklik metni burada yer alacak."}
                  </div>
                </div>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <div style="height:48px"></div>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <div style="border:1px solid #d4d4d4;padding:0px 0px 0px 0px">
                  <div
                    style="font-size:25px;font-weight:bold;padding:0px 0px 0px 0px"
                  >
                    Önceki Hali
                  </div>
                </div>
              </div>
              <div style="border:1px solid #d4d4d4;padding:0px 24px 0px 24px">
                <div style="font-weight:normal;padding:16px 0px 16px 0px">
                   ${body.oldState || "Önceki hali burada yer alacak."}
                </div>
              </div>
              <div style="height:24px"></div>
              <div style="padding:0px 0px 0px 0px">
                <div style="padding:0px 0px 0px 0px">
                  <table
                    align="center"
                    width="100%"
                    cellpadding="0"
                    border="0"
                    style="table-layout:fixed;border-collapse:collapse"
                  >
                    <tbody style="width:100%">
                      <tr style="width:100%">
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:0;padding-right:8px"
                        >
                          <div
                            style="font-weight:normal;text-align:center;padding:16px 24px 16px 24px"
                          >
                            Distill io Otomatik Bildirim
                          </div>
                        </td>
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:8px;padding-right:0"
                        >
                          <div
                            style="font-weight:normal;text-align:center;padding:16px 24px 16px 24px"
                          >
                            ${new Date().toLocaleDateString("tr-TR")}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
`;






        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject: 'Distil.io Bildirim - Yeni Güncellemeler',
            html2,
        });


        return res.json({ ok: true, message: 'Mail gönderildi' }, 200);
    } catch (err) {
        error(err);
        return res.json({ ok: false, error: err.message }, 500);
    }
};






