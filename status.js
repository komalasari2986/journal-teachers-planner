/* ======================================================
   KONTROL MODE MAINTENANCE / PEMELIHARAAN SISTEM
   - Set true  : Mengunci aplikasi (Maintenance Mode)
   - Set false : Aplikasi berjalan normal
   ====================================================== */
window.IS_MAINTENANCE = false; 
window.MAINTENANCE_BYPASS_KEY = "admin123";

(function initMaintenanceSystem() {
  let maintenanceInterval = null;

  function removeMaintenanceOverlay() {
    sessionStorage.removeItem("jtp_maintenance_bypassed");
    const overlay = document.getElementById("maintenanceOverlay");
    const style = document.getElementById("maintenance-styles");
    if (overlay) overlay.remove();
    if (style) style.remove();
    if (maintenanceInterval) clearInterval(maintenanceInterval);
  }

  function renderMaintenanceOverlay() {
    if (document.getElementById("maintenanceOverlay")) return;

    // 1. Inject Style Overlay
    const style = document.createElement("style");
    style.id = "maintenance-styles";
    style.innerHTML = `
      .maintenance-overlay {
        position: fixed; inset: 0; z-index: 999999;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex; align-items: center; justify-content: center;
        padding: 24px; color: #ffffff; text-align: center;
        font-family: 'Lexend', sans-serif;
      }
      .maintenance-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px; padding: 40px 30px;
        max-width: 480px; width: 100%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
      .maintenance-icon-box {
        width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%;
        background: rgba(217, 119, 6, 0.15); border: 2px solid #d97706;
        color: #f59e0b; display: grid; place-items: center; font-size: 34px;
        box-shadow: 0 0 25px rgba(245, 158, 11, 0.25);
      }
      .maintenance-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 10px; }
      .maintenance-text { font-size: 12.5px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; }
      .maintenance-badge {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(217, 119, 6, 0.2); color: #fbbf24;
        padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700;
        margin-bottom: 18px; border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .maintenance-btn {
        border: 0; border-radius: 10px; padding: 10px 14px; font-size: 11px;
        font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
      }
      .maintenance-btn-amber { background: #d97706; color: white; }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML Overlay
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
          Aplikasi <b>Journal Teachers Planner</b> saat ini sedang dalam proses perawatan rutin.<br><br>
          Halaman ini akan <b>otomatis terbuka</b> kembali setelah pemeliharaan selesai.
        </p>
        <div style="display:flex; justify-content:center;">
          <button class="maintenance-btn maintenance-btn-amber" onclick="promptBypassMaintenance()">
            <i class="fa-solid fa-key"></i> Akses Developer
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // 3. Fungsi Pengecekan Otomatis (Polling setiap 3 detik)
  function startRealtimeCheck() {
    maintenanceInterval = setInterval(() => {
      // Re-fetch file status.js dari server untuk membaca perubahan IS_MAINTENANCE
      fetch('status.js?v=' + new Date().getTime())
        .then(response => response.text())
        .then(code => {
          // Evaluasi status maintenance terbaru dari file
          const match = code.match(/window\.IS_MAINTENANCE\s*=\s*(true|false)/);
          if (match) {
            const isStillMaintenance = match[1] === "true";
            
            // Jika status berubah jadi FALSE, hapus overlay secara otomatis
            if (!isStillMaintenance) {
              removeMaintenanceOverlay();
            }
          }
        })
        .catch(err => console.log("Checking status..."));
    }, 3000); // 3000ms = Cek tiap 3 detik
  }

  // JALANKAN LOGIKA UTAMA
  const isBypassed = sessionStorage.getItem("jtp_maintenance_bypassed") === "true";

  if (!window.IS_MAINTENANCE) {
    removeMaintenanceOverlay();
  } else if (window.IS_MAINTENANCE && !isBypassed) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderMaintenanceOverlay);
    } else {
      renderMaintenanceOverlay();
    }
    startRealtimeCheck(); // Aktifkan auto-check real-time
  }
})();

// Fungsi bypass kata kunci developer
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
