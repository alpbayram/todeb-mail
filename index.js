const nodemailer = require("nodemailer");

// -------------------------
// SMTP transporter
// -------------------------
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// -------------------------
// 1) Payload'ı standart formata sok
// (ÖNCEKİ FUNCTION'DAKİ mapDistillToNewData gibi düşün)
// -------------------------
function normalizePayload(body) {
  const meta = body.meta || {};

  return {
    to: body.to || meta.to || process.env.SMTP_TO || process.env.SMTP_FROM,
    meta,
    // Burada shape'e karışmıyoruz:
    // - Basit watchers için added = [] (zaten array yolluyoruz)
    // - Composite watcher için { table, html } obje olarak kalacak
    added: body.added ?? [],
    removed: body.removed ?? [],
    changed: body.changed ?? []
  };
}


// ====================================================
//  📌 MAIL WATCHERS (meta.id -> render)
//  Her watcher kendi helper + html’ini taşır.
// ====================================================
const MAIL_WATCHERS = {
  // ------------------------------------------------
  // TCMB Ödeme Kuruluşları Tablosu
  // ------------------------------------------------
  "tcmb_odeme_kuruluslari": {
    render({ meta, added, removed, changed }) {
      // ====== TCMB helper’ları watcher içinde ======
      function buildAddedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const yetkiler = (item.yetkiler || []).join(", ") || "-";
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
        }).join("");
      }

      function buildRemovedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const yetkiler = (item.yetkiler || []).join(", ") || "-";
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
        }).join("");
      }

      function buildChangedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const eskiYetkiler = (item.yetkiler_eski || []).join(", ") || "-";
          const yeniYetkiler = (item.yetkiler || []).join(", ") || "-";

          return `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:middle;">
                ${item.kurulus_kodu}
              </td>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
                <div>${item.kurulus_adi_eski || "-"}</div>
                <div style="margin-top:4px;">${item.kurulus_adi}</div>
              </td>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
                <div>${eskiYetkiler}</div>
                <div style="margin-top:4px;">${yeniYetkiler}</div>
              </td>
            </tr>
          `;
        }).join("");
      }

      const addedRows = buildAddedRows(added);
      const removedRows = buildRemovedRows(removed);
      const changedRows = buildChangedRows(changed);

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yeni Değişiklikler</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${addedRows}</tbody>
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
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Silinenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${removedRows}</tbody>
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
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Değişenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${changedRows}</tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },

  // ------------------------------------------------
  // Örnek: Duyuru listesi (sadece title)
  // ------------------------------------------------
  // ------------------------------------------------
  // Dökümanlar Listesi Mail Watcher (title-only)
  // Tasarım: TCMB ile aynı, içerik: tablo yok, liste var
  // ------------------------------------------------
  "tcmb_odeme_sistemleri_ile_ilgili_mevzuat": {
    render({ meta, added, removed }) {

      function renderDocList(list) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Kayıt bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list
            .map(item => {
              const title =
                item.title || item.dokuman_adi || item.name || "-";

              // parseNewData'den gelen href (full URL)
              const href = item.href || null;

              if (href) {
                return `
                  <li style="margin:0 0 6px 0;">
                    <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                      ${title}
                    </a>
                  </li>
                `;
              } else {
                return `
                  <li style="margin:0 0 6px 0;">
                    ${title}
                  </li>
                `;
              }
            })
            .join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate =
        meta?.trDate || new Date().toLocaleDateString("tr-TR");

      const addedList = renderDocList(added);
      const removedList = renderDocList(removed);

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Distill Güncelleme</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SİLİNENLER -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Silinenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${removedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },
  "gib_taslaklar": {
    render({ meta, added, removed, changed }) {

      function renderList(list, { showOld = false } = {}) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Kayıt bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list.map(item => {
          const title = item.title || "-";
          const oldTitle = item.title_eski || "";
          const hasOld = showOld && oldTitle && oldTitle !== title;

          // href, run-function watcher'da payload'a ekleniyor
          const href = item.href || null;

          const content = hasOld
            ? `
                <div style="font-size:12px;color:#6b7280;margin-bottom:2px;">
                  Eski: ${oldTitle}
                </div>
                <div>
                  Yeni: ${title}
                </div>
              `
            : title;

          if (href) {
            return `
                <li style="margin:0 0 6px 0;">
                  <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                    ${content}
                  </a>
                </li>
              `;
          } else {
            return `
                <li style="margin:0 0 6px 0;">
                  ${content}
                </li>
              `;
          }
        }).join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      const addedList = renderList(added);
      const removedList = renderList(removed);
      const changedList = renderList(changed, { showOld: true });

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GİB Taslaklar Güncelleme</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName} - Taslaklar
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENEN TASLAKLAR -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Eklenen Taslaklar
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SİLİNEN TASLAKLAR -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Silinen Taslaklar
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${removedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BAŞLIĞI DEĞİŞEN TASLAKLAR -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Başlığı Değişen Taslaklar
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${changedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },

  "gib_uluslararasi_mevzuat": {
    render({ meta, added, removed /* changed yok */ }) {
      const BASE_URL = "https://gib.gov.tr";

      function buildHref(item) {
        // 1) parseNewData’den gelen href varsa onu kullan
        if (item.href) return item.href;

        // 2) yoksa mevzuat_id'den üret: turId_id
        if (item.mevzuat_id) {
          const [turId, docId] = String(item.mevzuat_id).split("_");
          if (turId && docId) {
            return `${BASE_URL}/mevzuat/tur/${turId}/anlasma/${docId}`;
          }
        }

        // 3) link üretemiyorsak null dön
        return null;
      }

      function renderList(list) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Kayıt bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list
            .map((item) => {
              const title = item.title || "-";
              const href = buildHref(item);

              if (href) {
                return `
                  <li style="margin:0 0 6px 0;">
                    <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                      ${title}
                    </a>
                  </li>
                `;
              } else {
                return `
                  <li style="margin:0 0 6px 0;">
                    ${title}
                  </li>
                `;
              }
            })
            .join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate =
        meta?.trDate || new Date().toLocaleDateString("tr-TR");

      const addedList = renderList(added);
      const removedList = renderList(removed);

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Uluslararası Mevzuat Güncelleme</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName
          ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                `
          : ""
        }

                ${metaUri
          ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                `
          : ""
        }
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SİLİNENLER -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Silinenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${removedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },
  "tcmb_odeme_kuruluslari_paragraf": {
    render({ meta, added, removed, changed }) {
      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      // distill sadece değiştiğinde tetiklediği için çoğunlukla changed[0] dolu gelecek
      const newHtml =
        (changed?.[0]?.textHtml) ||
        (added?.[0]?.textHtml) ||
        "";

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Paragraf Güncelleme</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Yeni Paragraf -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <div style="border:2px solid #b0b0b0;padding:12px;font-size:14px;color:#111827;line-height:1.6;">
                  ${newHtml || "<p>Kayıt bulunamadı.</p>"}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },// ------------------------------------------------
  // TCMB Duyurular Mail Watcher
  // (sadece Yeni Duyurular listesini gösterir)
  // ------------------------------------------------
  "vergi_mevzuati": {
    render({ meta, added, removed }) {
      function renderList(list, useHref) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Kayıt bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list
            .map(item => {
              const title = item.title || "-";
              const href = useHref ? item.href : null;

              if (href) {
                return `
                  <li style="margin:0 0 6px 0;">
                    <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                      ${title}
                    </a>
                  </li>
                `;
              } else {
                return `
                  <li style="margin:0 0 6px 0;">
                    ${title}
                  </li>
                `;
              }
            })
            .join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      // added: href var (newData'dan geliyor), removed: sadece title/mevzuat_id
      const addedList = renderList(added, true);
      const removedList = renderList(removed, false);

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vergi Mevzuatı Güncelleme</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ EKLENENLER -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- LİSTEDEN KALDIRILANLAR -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Listeden Kaldırılanlar
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${removedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },

  "duyurular": {
    render({ meta, added /*, removed, changed */ }) {

      // GİB base URL – slug bunun arkasına eklenecek
      const BASE_URL = "https://gib.gov.tr/duyuru-arsivi/guncel/";

      function renderAnnouncements(list) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Yeni duyuru bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list
            .map(item => {
              const title = item.title || "-";

              // Öncelik: item.href > item.slug
              let href = null;

              if (item.href) {
                href = item.href;
              } else if (item.slug) {
                // slug başında / varsa temizle
                const cleanSlug = String(item.slug).replace(/^\/+/, "");
                href = BASE_URL + cleanSlug;
              }

              if (href) {
                return `
                  <li style="margin:0 0 6px 0;">
                    <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                      ${title}
                    </a>
                  </li>
                `;
              } else {
                return `<li style="margin:0 0 6px 0;">${title}</li>`;
              }
            })
            .join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      const addedList = renderAnnouncements(added);

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yeni Duyurular</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ DUYURULAR -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Duyurular
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },

  "tcmb_odeme_kuruluslari_table_paragraf": {
    render({ meta, added = {}, removed = {}, changed = {} }) {
      // ---- 1) Nested objeleri aç ----
      const tableAdded = added.table || [];
      const tableRemoved = removed.table || [];
      const tableChanged = changed.table || [];

      const htmlAdded = added.html || [];
      const htmlRemoved = removed.html || [];
      const htmlChanged = changed.html || [];

      // ---- 3.1) Tablo satır helper’ları (TCMB ile aynı) ----
      function buildAddedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const yetkiler = (item.yetkiler || []).join(", ") || "-";
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
        }).join("");
      }

      function buildRemovedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const yetkiler = (item.yetkiler || []).join(", ") || "-";
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
        }).join("");
      }

      function buildChangedRows(list) {
        if (!list.length) {
          return `
            <tr>
              <td colspan="3" style="padding:8px;font-size:13px;color:#777777;">
                Kayıt bulunamadı.
              </td>
            </tr>
          `;
        }

        return list.map(item => {
          const eskiYetkiler = (item.yetkiler_eski || []).join(", ") || "-";
          const yeniYetkiler = (item.yetkiler || []).join(", ") || "-";

          return `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:middle;">
                ${item.kurulus_kodu}
              </td>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
                <div>${item.kurulus_adi_eski || "-"}</div>
                <div style="margin-top:4px;">${item.kurulus_adi}</div>
              </td>
              <td style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;vertical-align:top;">
                <div>${eskiYetkiler}</div>
                <div style="margin-top:4px;">${yeniYetkiler}</div>
              </td>
            </tr>
          `;
        }).join("");
      }

      const addedRows = buildAddedRows(tableAdded);
      const removedRows = buildRemovedRows(tableRemoved);
      const changedRows = buildChangedRows(tableChanged);

      // ---- 3.2) Paragraf bloğu ----
      let paragraphInner = "";

      if (htmlChanged.length > 0) {
        const p = htmlChanged[0];
        paragraphInner = `
          <div style="font-size:13px;color:#111827;line-height:1.5;">           
            <div>${p.textHtml || "-"}</div>
          </div>
        `;
      } else if (htmlAdded.length > 0) {
        const p = htmlAdded[0];
        paragraphInner = `
          <div style="font-size:13px;color:#111827;line-height:1.5;">
            <div style="margin-bottom:6px;"><strong>Yeni paragraf:</strong></div>
            <div>${p.textHtml || "-"}</div>
          </div>
        `;
      } else if (htmlRemoved.length > 0) {
        const p = htmlRemoved[0];
        paragraphInner = `
          <div style="font-size:13px;color:#111827;line-height:1.5;">
            <div style="margin-bottom:6px;"><strong>Kaldırılan paragraf:</strong></div>
            <div>${p.textHtml || "-"}</div>
          </div>
        `;
      } else {
        paragraphInner = `
          <p style="margin:0;font-size:13px;color:#777777;">
            Paragraf değişikliği bulunmamaktadır.
          </p>
        `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      // ---- 3.3) Hem tablo hem paragraf tek template'te ----
      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yeni Değişiklikler</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- TABLO: Yeni Eklenenler -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Yeni Eklenenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${addedRows}</tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TABLO: Silinenler -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Silinenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${removedRows}</tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TABLO: Değişenler -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:18px;font-weight:bold;color:#000000;padding-bottom:8px;">
                      Değişenler
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:0;font-size:14px;color:#405464;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <thead>
                          <tr>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Kuruluş Kodu
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;">
                              Kuruluş Adı
                            </th>
                            <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                              Yetkileri
                            </th>
                          </tr>
                        </thead>
                        <tbody>${changedRows}</tbody>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PARAGRAF DEĞİŞİKLİKLERİ -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <th align="left" style="padding:8px;border-bottom:1px solid #b0b0b0;font-size:13px;font-weight:bold;background-color:#42525e;color:white;width:100px;">
                      Paragraf Değişiklikleri
                    </th>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${paragraphInner}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },

  "tcmb_duyurular": {
    render({ meta, added /* removed, changed */ }) {
      function renderAnnouncements(list) {
        if (!list || list.length === 0) {
          return `
          <p style="margin:0;padding:8px;font-size:13px;color:#777777;">
            Yeni duyuru bulunamadı.
          </p>
        `;
        }

        return `
        <ul style="margin:0 0 0 -12px;padding:0 0 0 24px;font-size:13px;color:#111827;line-height:1.6;">
          ${list
            .map(item => {
              const title = item.title || "-";
              const href = item.href || null;

              if (href) {
                return `<li style="margin:0 0 6px 0;">
                <a href="${href}" style="color:#1d4ed8;text-decoration:underline;">
                  ${title}
                </a>
              </li>`;
              } else {
                return `<li style="margin:0 0 6px 0;">${title}</li>`;
              }
            })
            .join("")}
        </ul>
      `;
      }

      const metaName = meta?.name || "";
      const metaUri = meta?.uri || "";
      const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

      const addedList = renderAnnouncements(added);

      return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yeni Duyurular</title>
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="width:600px;max-width:600px;border:12px solid #42525e;background-color:#ffffff;border-radius:18px;">

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#d4d4d4;padding:16px 0 12px 0;">
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
              <td align="center" style="background-color:#d4d4d4;padding:8px 24px 12px 24px;">
                ${metaName ? `
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#000000;">
                    ${metaName}
                  </p>
                ` : ""}

                ${metaUri ? `
                  <p style="margin:4px 0 0 0;font-size:12px;">
                    <a href="${metaUri}" style="color:#1d4ed8;text-decoration:underline;">
                      Siteye gitmek için tıklayınız
                    </a>
                  </p>
                ` : ""}
              </td>
            </tr>

            <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- YENİ DUYURULAR -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:16px;font-weight:bold;color:#000000;padding-bottom:6px;">
                      Yeni Duyurular
                    </td>
                  </tr>
                  <tr>
                    <td style="border:2px solid #b0b0b0;padding:10px;font-size:14px;color:#405464;">
                      ${addedList}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f0f0f0;padding:12px;font-size:12px;color:#000000;">
                ${metaTrDate}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
  },




};

// -------------------------
// Watcher seçimi (öncekine benzer)
// -------------------------
function pickWatcher(meta) {
  const key = meta?.id; // Distill slug
  return MAIL_WATCHERS[key];
}

// -------------------------
// Ana handler
// -------------------------
module.exports = async (context) => {
  const { req, res, log, error } = context;

  try {
    log("Mail function started");

    const rawBody = req.body || {};
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

    // 1) normalize (payload hep aynı)
    const payload = normalizePayload(body);

    // 2) watcher seç
    const watcher = pickWatcher(payload.meta);
    if (!watcher) {
      throw new Error(`Mail watcher bulunamadı. meta.id=${payload.meta?.id}`);
    }

    // 3) render (watcher bilir)
    const html = watcher.render(payload);

    // 4) send
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: payload.to,
      subject: "Güncelleme Raporu", // SABİT
      html
    });

    log("Mail sent successfully");
    return res.json({ ok: true, message: "Mail gönderildi" }, 200);
  } catch (err) {
    if (error) error(err);
    return res.json({ ok: false, error: err.message }, 500);
  }
};
