<div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
  <!-- Üst kısım: Logo ve başlık -->
  <div style="background-color:#f9fafb;padding:24px 24px 16px 24px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <img
      src="https://fra.cloud.appwrite.io/v1/storage/buckets/690aedd20007ff371e3f/files/690aeddb0026f4902a30/view?project=6909b793000a48fd66d8&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbklkIjoiNjkwYWYxYjIyZGQ0ZjU2ZTI2ZjQiLCJyZXNvdXJjZUlkIjoiNjkwYWVkZDIwMDA3ZmYzNzFlM2Y6NjkwYWVkZGIwMDI2ZjQ5MDJhMzAiLCJyZXNvdXJjZVR5cGUiOiJmaWxlcyIsInJlc291cmNlSW50ZXJuYWxJZCI6IjQ3NjA2OjEiLCJpYXQiOjE3NjIzMjQ5MTR9.Andvio7zk6UFQ3eMJNwD9J9_JjJ_fEa147zyfBhD0Q8"
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
      Distil.io Otomatik Bildirim • ${new Date().toLocaleDateString('tr-TR')}
    </p>
  </div>
</div>
