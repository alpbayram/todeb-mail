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
		added: Array.isArray(body.added) ? body.added : [],
		removed: Array.isArray(body.removed) ? body.removed : [],
		changed: Array.isArray(body.changed) ? body.changed : []
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
          ${list.map(item => {
					const title = item.title || item.dokuman_adi || item.name || "-";
					return `<li style="margin:0 0 6px 0;">${title}</li>`;
				}).join("")}
        </ul>
      `;
			}

			const metaName = meta?.name || "";
			const metaUri = meta?.uri || "";
			const metaTrDate = meta?.trDate || new Date().toLocaleDateString("tr-TR");

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
	"duyurular": {
		render({ meta, added /*, removed, changed */ }) {

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
							const href = false;

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
                    ${metaName} - Yeni Duyurular
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
		// --------------------
		//  parseNewData
		// --------------------
		parseNewData(distillPayload) {
			const {
				id,
				name,
				uri,
				text,
				ts,
				to,
				dbCollectionTable,
				dbCollectionHtml
			} = distillPayload;

			const root = JSON.parse(text || "{}");
			const tableArr = Array.isArray(root.table) ? root.table : [];
			const htmlArr = Array.isArray(root.html) ? root.html : [];
			const htmlRaw = htmlArr[0] || root.html || "";

			// TABLO: önceki TCMB watcher ile aynı mantık
			const tableNewData = tableArr.map(item => ({
				kurulus_kodu: String(item.code ?? "").trim(),
				kurulus_adi: String(item.name ?? "").trim(),
				yetkiler: Array.isArray(item.rights) ? item.rights : []
			}));

			// HTML: tek satır, textHtml alanında tutacağız
			const htmlNewData = htmlRaw
				? [
					{
						textHtml: String(htmlRaw)
					}
				]
				: [];

			const trDate = ts
				? new Date(ts).toLocaleString("tr-TR", {
					timeZone: "Europe/Istanbul",
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				})
				: null;

			return {
				meta: {
					id,
					name,
					uri,
					trDate,
					to,
					dbCollectionTable,
					dbCollectionHtml
				},
				// iki ayrı dataset beraber dönüyor
				newData: {
					table: tableNewData,
					html: htmlNewData
				}
			};
		},

		// --------------------
		//  getOldData
		// --------------------
		async getOldData(databases, meta) {
			const limit = 100;

			async function loadAll(collectionId, mapFn) {
				if (!collectionId) return [];

				let offset = 0;
				let allDocs = [];
				let keepGoing = true;

				while (keepGoing) {
					const page = await databases.listDocuments(
						APPWRITE_DATABASE_ID,
						collectionId,
						[Query.limit(limit), Query.offset(offset)]
					);

					allDocs = allDocs.concat(page.documents);

					if (page.documents.length < limit) {
						keepGoing = false;
					} else {
						offset += limit;
					}
				}

				return allDocs.map(mapFn);
			}

			// TABLO: kurulus_kodu / kurulus_adi / yetkiler
			const tableOld = await loadAll(meta.dbCollectionTable, doc => ({
				docId: doc.$id,
				kurulus_kodu: doc.kurulus_kodu,
				kurulus_adi: doc.kurulus_adi,
				yetkiler: doc.yetkiler || []
			}));

			// HTML: tek kayıt, textHtml alanında
			const htmlOld = await loadAll(meta.dbCollectionHtml, doc => ({
				docId: doc.$id,
				textHtml: doc.textHtml || ""
			}));

			return {
				table: tableOld,
				html: htmlOld
			};
		},

		// --------------------
		//  compare
		// --------------------
		compare(oldData, newData) {
			const oldTable = oldData.table || [];
			const newTable = newData.table || [];

			const oldHtml = oldData.html || [];
			const newHtml = newData.html || [];

			// ==== TABLO KARŞILAŞTIRMA (eski TCMB mantığı) ====
			const oldCodes = new Set(oldTable.map(i => i.kurulus_kodu));
			const newCodes = new Set(newTable.map(i => i.kurulus_kodu));

			const tableAdded = newTable.filter(i => !oldCodes.has(i.kurulus_kodu));
			const tableRemoved = oldTable.filter(i => !newCodes.has(i.kurulus_kodu));

			const common = newTable.filter(i => oldCodes.has(i.kurulus_kodu));

			const degisenName = [];
			const degisenRights = [];

			for (let i = 0; i < common.length; i++) {
				const item = common[i];
				const kod = item.kurulus_kodu;
				const oldItem = oldTable.find(x => x.kurulus_kodu === kod);
				if (!oldItem) continue;

				if (item.kurulus_adi !== oldItem.kurulus_adi) {
					degisenName.push(item);
				}

				const yeniYet = item.yetkiler || [];
				const eskiYet = oldItem.yetkiler || [];

				const yetkiDegisti =
					eskiYet.length !== yeniYet.length ||
					eskiYet.some(y => !yeniYet.includes(y)) ||
					yeniYet.some(y => !eskiYet.includes(y));

				if (yetkiDegisti) {
					degisenRights.push(item);
				}
			}

			const tumDegisen = [...degisenName, ...degisenRights];
			const seen = new Set();
			const uniqNew = [];

			for (let i = 0; i < tumDegisen.length; i++) {
				const it = tumDegisen[i];
				if (!seen.has(it.kurulus_kodu)) {
					seen.add(it.kurulus_kodu);
					uniqNew.push(it);
				}
			}

			const tableChanged = uniqNew.map(newItem => {
				const kod = newItem.kurulus_kodu;
				const oldItem = oldTable.find(x => x.kurulus_kodu === kod) || {};

				return {
					kurulus_kodu: kod,
					kurulus_adi: newItem.kurulus_adi,
					kurulus_adi_eski: oldItem.kurulus_adi ?? null,
					yetkiler: newItem.yetkiler || [],
					yetkiler_eski: oldItem.yetkiler || []
				};
			});

			// ==== HTML KARŞILAŞTIRMA (tek kayıt) ====
			let htmlAdded = [];
			let htmlRemoved = [];
			let htmlChanged = [];

			const oldHtmlItem = oldHtml[0];
			const newHtmlItem = newHtml[0];

			if (!oldHtmlItem && newHtmlItem) {
				// databasede yoktu → eklendi
				htmlAdded = [newHtmlItem];
			} else if (oldHtmlItem && !newHtmlItem) {
				// databasede vardı, sayfadan kalktı
				htmlRemoved = [oldHtmlItem];
			} else if (oldHtmlItem && newHtmlItem) {
				if ((oldHtmlItem.textHtml || "") !== (newHtmlItem.textHtml || "")) {
					htmlChanged = [
						{
							textHtml_eski: oldHtmlItem.textHtml || "",
							textHtml: newHtmlItem.textHtml || ""
						}
					];
				}
			}

			// sendReportMail için birleşik obje
			return {
				added: {
					table: tableAdded,
					html: htmlAdded
				},
				removed: {
					table: tableRemoved,
					html: htmlRemoved
				},
				changed: {
					table: tableChanged,
					html: htmlChanged
				}
			};
		},

		// --------------------
		//  syncDb
		// --------------------
		async syncDb(databases, oldData, newData, removed, meta) {
			const oldTable = oldData.table || [];
			const newTable = newData.table || [];

			const oldHtml = oldData.html || [];
			const newHtml = newData.html || [];

			const removedTable = (removed && removed.table) || [];
			const removedHtml = (removed && removed.html) || [];

			// === TABLO SENKRONU (eski TCMB syncDb ile aynı mantık) ===
			if (meta.dbCollectionTable) {
				const byCode = new Map(
					oldTable.map(i => [i.kurulus_kodu, i])
				);

				// removed sil
				for (let i = 0; i < removedTable.length; i++) {
					const item = removedTable[i];
					const existing = byCode.get(item.kurulus_kodu);
					if (existing?.docId) {
						await databases.deleteDocument(
							APPWRITE_DATABASE_ID,
							meta.dbCollectionTable,
							existing.docId
						);
					}
				}

				// upsert
				for (let i = 0; i < newTable.length; i++) {
					const item = newTable[i];
					const existing = byCode.get(item.kurulus_kodu);

					const payload = {
						kurulus_kodu: item.kurulus_kodu,
						kurulus_adi: item.kurulus_adi,
						yetkiler: item.yetkiler
					};

					if (existing?.docId) {
						await databases.updateDocument(
							APPWRITE_DATABASE_ID,
							meta.dbCollectionTable,
							existing.docId,
							payload
						);
					} else {
						await databases.createDocument(
							APPWRITE_DATABASE_ID,
							meta.dbCollectionTable,
							ID.unique(),
							payload
						);
					}
				}
			}

			// === HTML SENKRONU (tek kayıt, textHtml alanı) ===
			if (meta.dbCollectionHtml) {
				const oldItem = oldHtml[0] || null;
				const newItem = newHtml[0] || null;

				// removed varsa hepsini sil (biz zaten max 1 kayıt bekliyoruz)
				if (removedHtml.length && oldItem?.docId) {
					await databases.deleteDocument(
						APPWRITE_DATABASE_ID,
						meta.dbCollectionHtml,
						oldItem.docId
					);
				}

				// yeni html varsa create/update
				if (newItem) {
					const payload = { textHtml: newItem.textHtml || "" };

					if (oldItem?.docId) {
						await databases.updateDocument(
							APPWRITE_DATABASE_ID,
							meta.dbCollectionHtml,
							oldItem.docId,
							payload
						);
					} else {
						await databases.createDocument(
							APPWRITE_DATABASE_ID,
							meta.dbCollectionHtml,
							ID.unique(),
							payload
						);
					}
				}
			}
		}
	},

	"tcmb_duyurular": {
		render({ meta, added /*, removed, changed */ }) {

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
							const href = false;

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
                    ${metaName} - Yeni Duyurular
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
	}



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
