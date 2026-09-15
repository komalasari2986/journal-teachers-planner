/* ======================================================
   KONTROL MODE MAINTENANCE / PEMELIHARAAN SISTEM
   - Ubah `IS_MAINTENANCE` ke `true` untuk mengunci situs
   - Ubah `IS_MAINTENANCE` ke `false` untuk berjalan normal
   ====================================================== */
window.IS_MAINTENANCE = true; 
window.MAINTENANCE_BYPASS_KEY = "admin123";

(function initMaintenanceSystem() {
  // Hanya jalankan jika status maintenance aktif dan user belum melakukan bypass
  const isBypassed = sessionStorage.getItem("jtp_maintenance_bypassed") === "true";
  
  if (!window.IS_MAINTENANCE) {
    sessionStorage.removeItem("jtp_maintenance_bypassed");
    return;
  }

  if (window.IS_MAINTENANCE && !isBypassed) {
    // Inject CSS khusus Overlay Maintenance
    const style = document.createElement("style");
    style.id = "maintenance-styles";
    style.innerHTML = `
      .maintenance-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: #ffffff;
        text-align: center;
        font-family: 'Lexend', sans-serif;
      }
      .maintenance-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        padding: 40px 30px;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
      .maintenance-icon-box {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        border-radius: 50%;
        background: rgba(217, 119, 6, 0.15);
        border: 2px solid #d97706;
        color: #f59e0b;
        display: grid;
        place-items: center;
        font-size: 34px;
        box-shadow: 0 0 25px rgba(245, 158, 11, 0.25);
      }
      .maintenance-title {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }
      .maintenance-text {
        font-size: 12.5px;
        color: #cbd5e1;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .maintenance-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(217, 119, 6, 0.2);
        color: #fbbf24;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 18px;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .maintenance-btn {
        border: 0;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: .2s;
      }
      .maintenance-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      .maintenance-btn-sec { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
      .maintenance-btn-amber { background: #d97706; color: white; }
    `;
    document.head.appendChild(style);

    // Inject Elemen Overlay ke dalam <body> setelah halaman siap
    document.addEventListener("DOMContentLoaded", () => {
      const overlay = document.createElement("div");
      overlay.id = "maintenanceOverlay";
      overlay.className = "maintenance-overlay";
      overlay.innerHTML = `
        <div class="maintenance-card">
          <div class="maintenance-icon-box">
            <i class="fa-solid fa-screwdriver-wrench fa-spin" style="--fa-animation-duration: 4s;"></i>
          </div>
          <div class="maintenance-badge">
            <i class="fa-solid fa-triangle-exclamation"></i> Pemeliharaan Sistem Berjalan
          </div>
          <h1 class="maintenance-title">Sistem Sedang Pemeliharaan</h1>
          <p class="maintenance-text">
            Aplikasi <b>Journal Teachers Planner</b> saat ini sedang dalam proses pembaruan data dan perawatan rutin sistem untuk meningkatkan kinerja.<br><br>
            Silakan kembali lagi dalam beberapa saat. Terima kasih atas kesabaran Anda.
          </p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button class="maintenance-btn maintenance-btn-sec" onclick="location.reload()">
              <i class="fa-solid fa-rotate-right"></i> Muat Ulang
            </button>
            <button class="maintenance-btn maintenance-btn-amber" onclick="promptBypassMaintenance()">
              <i class="fa-solid fa-key"></i> Akses Developer
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    });
  }
})();

// Fungsi untuk bypass kata kunci developer
function promptBypassMaintenance() {
  const pass = prompt("Masukkan Kunci Akses Developer / Admin:");
  const bypassKey = window.MAINTENANCE_BYPASS_KEY || "admin123";

  if (pass === bypassKey) {
    sessionStorage.setItem("jtp_maintenance_bypassed", "true");
    const overlay = document.getElementById("maintenanceOverlay");
    if (overlay) overlay.remove();
    alert("Kunci Akses Diterima! Anda masuk sebagai Developer.");
  } else if (pass !== null) {
    alert("Kunci Akses Salah!");
  }
}
