/* ======================================================
   KONTROL MODE MAINTENANCE JARAK JAUH (ADMIN PANEL ?admin=1)
   Terhubung ke Google Apps Script (Code.gs)
   ====================================================== */
(function initRemoteMaintenanceSystem() {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbzWiFtzRnSmsKUa_9jGalvvxSEjaL22SoBx_7V4hBR-XHeBk__a_Jvi2G3RSl03iY37/exec";
  const STORAGE_KEY = "jtp_maintenance_config_v2";
  const ADMIN_TOKEN_KEY = "jtp_admin_maintenance_token_v2";
  const IS_ADMIN_ROUTE = new URLSearchParams(window.location.search).get("admin") === "1";

  const PATTERN_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='rgba(148,163,184,0.09)' stroke-width='1'%3E%3Cpath d='M32 0 L64 32 L32 64 L0 32 Z'/%3E%3Crect x='13.25' y='13.25' width='37.5' height='37.5'/%3E%3Cpath d='M0 0 L13.25 13.25 M64 0 L50.75 13.25 M64 64 L50.75 50.75 M0 64 L13.25 50.75'/%3E%3C/g%3E%3C/svg%3E\")";

  let adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";

  function readLocalConfig() {
    try {
      const cfg = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        enabled: Boolean(cfg.enabled),
        message: String(cfg.message || "Aplikasi Journal Teachers Planner saat ini sedang dalam proses perawatan dan pembaruan rutin."),
        eta: String(cfg.eta || ""),
        updatedAt: String(cfg.updatedAt || "")
      };
    } catch (_) {
      return { enabled: false, message: "Aplikasi Journal Teachers Planner saat ini sedang dalam proses perawatan dan pembaruan rutin.", eta: "", updatedAt: "" };
    }
  }

  function saveLocalConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch (_) {}
  }

  async function gasPost(body) {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      redirect: "follow"
    });
    const text = await res.text();
    const data = JSON.parse(text);
    if (!data || !data.ok) throw new Error((data && data.error) || "Permintaan ditolak server.");
    return data;
  }

  function injectStyles() {
    if (document.getElementById("jtp-maintenance-styles")) return;
    const style = document.createElement("style");
    style.id = "jtp-maintenance-styles";
    style.innerHTML = `
      .jtp-maint-bg {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0f172a;
        background-image:
          ${PATTERN_SVG},
          radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 38%, transparent 68%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        background-size: 64px 64px, 100% 100%, 100% 100%;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; color: #ffffff;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow-y: auto;
      }
      .jtp-maint-card {
        width: min(960px, 100%);
        padding: clamp(28px, 4vw, 46px);
        display: grid;
        grid-template-columns: 270px 1fr;
        gap: clamp(28px, 4vw, 52px);
        align-items: center;
        background: rgba(15, 23, 42, 0.82);
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 28px;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
        text-align: left;
      }
      .jtp-maint-left {
        display: flex; flex-direction: column; align-items: center; text-align: center;
        padding-right: 28px; border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
      .jtp-maint-logo-wrap {
        width: 86px; height: 86px; border-radius: 50%;
        background: #ffffff; padding: 4px; display: grid; place-items: center;
        margin-bottom: 14px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.3); overflow: hidden;
      }
      .jtp-maint-logo {
        width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;
      }
      .jtp-maint-logo-fallback { display: none; color: #047857; font-size: 30px; }
      .jtp-maint-school {
        font-size: 11px; font-weight: 800; letter-spacing: 1px;
        text-transform: uppercase; color: #6ee7b7; margin-bottom: 3px;
      }
      .jtp-maint-app {
        font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 20px;
      }
      .jtp-maint-tool {
        display: grid; place-items: center; width: 76px; height: 76px;
        border-radius: 22px; color: #ffffff; font-size: 30px;
        background: linear-gradient(135deg, #059669, #047857);
        box-shadow: 0 14px 30px rgba(5, 150, 105, 0.3); margin-bottom: 18px;
      }
      .jtp-maint-badge {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(217, 119, 6, 0.18); color: #fbbf24;
        padding: 6px 14px; border-radius: 999px; font-size: 10.5px; font-weight: 800;
        letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.38);
      }
      .jtp-maint-dot {
        width: 7px; height: 7px; border-radius: 50%; background: #fbbf24;
        box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.18);
        animation: jtpMaintPulse 1.8s ease-in-out infinite;
      }
      @keyframes jtpMaintPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .jtp-maint-right { display: flex; flex-direction: column; align-items: flex-start; }
      .jtp-maint-title {
        font-size: clamp(23px, 2.4vw, 31px); font-weight: 800; color: #ffffff;
        line-height: 1.2; margin-bottom: 12px;
      }
      .jtp-maint-msg {
        font-size: 13.5px; color: #cbd5e1; line-height: 1.75; white-space: pre-wrap;
      }
      .jtp-maint-eta {
        display: none; align-items: center; gap: 9px; margin-top: 16px;
        background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.35);
        color: #a7f3d0; padding: 11px 14px; border-radius: 12px;
        font-size: 12px; font-weight: 600;
      }
      .jtp-maint-eta.show { display: flex; }
      .jtp-maint-divider {
        width: 76px; height: 3px; margin: 20px 0 14px;
        border-radius: 99px; background: linear-gradient(90deg, #10b981, #34d399);
      }
      .jtp-maint-help {
        color: #94a3b8; font-size: 12px; line-height: 1.7; margin-bottom: 20px;
      }
      .jtp-maint-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
      .jtp-maint-btn {
        border: 0; border-radius: 12px; padding: 12px 22px; font-size: 12.5px;
        font-weight: 700; cursor: pointer; display: inline-flex; align-items: center;
        justify-content: center; gap: 9px; font-family: inherit;
        background: linear-gradient(135deg, #047857, #059669); color: #ffffff;
        box-shadow: 0 8px 22px rgba(5, 150, 105, 0.32);
        transition: filter 0.2s ease, transform 0.15s ease;
      }
      .jtp-maint-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
      .jtp-maint-btn:disabled { opacity: 0.65; cursor: wait; transform: none; }
      .jtp-maint-status { font-size: 11px; color: #64748b; }
      @media (max-width: 760px) {
        .jtp-maint-card { grid-template-columns: 1fr; gap: 24px; padding: 28px 22px; border-radius: 24px; }
        .jtp-maint-left { padding-right: 0; padding-bottom: 22px; border-right: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .jtp-maint-right { align-items: center; text-align: center; }
        .jtp-maint-actions { justify-content: center; }
      }
      /* Admin Portal */
      .jtp-admin-card { display: block; min-height: 0; text-align: left; max-width: 520px; padding: 34px 30px; background: rgba(15, 23, 42, 0.85); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.14); }
      .jtp-admin-field { display: block; margin-bottom: 14px; }
      .jtp-admin-field label {
        display: block; font-size: 10.5px; font-weight: 700; color: #cbd5e1;
        text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
      }
      .jtp-admin-field input, .jtp-admin-field textarea {
        width: 100%; padding: 11px 13px; border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.18); background: rgba(15, 23, 42, 0.78);
        color: #ffffff; font-size: 12.5px; font-family: inherit; outline: none;
      }
      .jtp-admin-field input:focus, .jtp-admin-field textarea:focus { border-color: #10b981; }
      .jtp-admin-toggle {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 14px; border-radius: 14px; margin-bottom: 16px;
        background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14);
        cursor: pointer;
      }
      .jtp-admin-toggle input { width: 20px; height: 20px; accent-color: #10b981; cursor: pointer; }
      .jtp-admin-alert {
        padding: 10px 13px; border-radius: 10px; font-size: 11.5px; margin-bottom: 14px;
        background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.14);
      }
      .jtp-admin-alert.ok { background: rgba(16, 185, 129, 0.16); color: #a7f3d0; border-color: rgba(16, 185, 129, 0.35); }
      .jtp-admin-alert.err { background: rgba(225, 29, 72, 0.18); color: #fecdd3; border-color: rgba(225, 29, 72, 0.38); }
    `;
    document.head.appendChild(style);
  }

  function renderMaintenanceOverlay(cfg) {
    injectStyles();
    let overlay = document.getElementById("maintenanceOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "maintenanceOverlay";
      overlay.className = "jtp-maint-bg";
      overlay.innerHTML = `
        <div class="jtp-maint-card">
          <aside class="jtp-maint-left">
            <div class="jtp-maint-logo-wrap">
              <img id="jtpMaintLogoImg" class="jtp-maint-logo" src="assets/logo-sekolah.jpg" alt="Logo SD Islam Ramah Anak">
              <span id="jtpMaintLogoFallback" class="jtp-maint-logo-fallback"><i class="fa-solid fa-school"></i></span>
            </div>
            <div class="jtp-maint-school">SD Islam Ramah Anak</div>
            <div class="jtp-maint-app">Journal Teachers Planner</div>
            <div class="jtp-maint-tool" aria-hidden="true"><i class="fa-solid fa-screwdriver-wrench"></i></div>
            <span class="jtp-maint-badge"><span class="jtp-maint-dot"></span> Pemeliharaan Sistem</span>
          </aside>
          <section class="jtp-maint-right">
            <h1 class="jtp-maint-title">Aplikasi Sedang Dalam Pemeliharaan</h1>
            <p id="jtpMaintMsg" class="jtp-maint-msg"></p>
            <div id="jtpMaintEta" class="jtp-maint-eta">
              <i class="fa-regular fa-clock"></i>
              <span>Perkiraan selesai: <strong id="jtpMaintEtaVal"></strong></span>
            </div>
            <div class="jtp-maint-divider"></div>
            <p class="jtp-maint-help">Kami sedang melakukan pembaruan agar pengisian jurnal guru berjalan lebih lancar. Data akun dan seluruh jurnal Bapak/Ibu tetap tersimpan aman di server.</p>
            <div class="jtp-maint-actions">
              <button type="button" id="jtpMaintCheckBtn" class="jtp-maint-btn">
                <i class="fa-solid fa-rotate"></i> Periksa Kembali
              </button>
              <span id="jtpMaintCheckStatus" class="jtp-maint-status">Halaman akan otomatis terbuka setelah pemeliharaan selesai.</span>
            </div>
          </section>
        </div>
      `;
      const attach = () => {
        if (document.body && !document.getElementById("maintenanceOverlay")) {
          document.body.appendChild(overlay);
          document.getElementById("jtpMaintCheckBtn")?.addEventListener("click", manualCheckMaintenance);
          const logoImg = document.getElementById("jtpMaintLogoImg");
          const logoFallback = document.getElementById("jtpMaintLogoFallback");
          if (logoImg) {
            const cands = ["assets/logo-sekolah.jpg", "assets/logo-sekolah.png", "assets/logo-sekolah.jpeg", "assets/logo-sekolah.webp"];
            let cIdx = 0;
            logoImg.onerror = () => {
              cIdx++;
              if (cIdx < cands.length) logoImg.src = cands[cIdx];
              else { logoImg.style.display = "none"; if (logoFallback) logoFallback.style.display = "block"; }
            };
          }
        }
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
      else attach();
    }

    const msgEl = document.getElementById("jtpMaintMsg");
    const etaWrap = document.getElementById("jtpMaintEta");
    const etaVal = document.getElementById("jtpMaintEtaVal");
    if (msgEl) msgEl.textContent = cfg.message;
    if (etaWrap && etaVal) {
      etaVal.textContent = cfg.eta || "";
      etaWrap.classList.toggle("show", Boolean(cfg.eta));
    }
  }

  function removeMaintenanceOverlay() {
    document.getElementById("maintenanceOverlay")?.remove();
  }

  async function manualCheckMaintenance() {
    const btn = document.getElementById("jtpMaintCheckBtn");
    const st = document.getElementById("jtpMaintCheckStatus");
    if (btn) btn.disabled = true;
    if (st) st.textContent = "Memeriksa status server...";
    try {
      await fetchRemoteStatus();
      const cfg = readLocalConfig();
      if (st) st.textContent = cfg.enabled ? "Pemeliharaan masih berlangsung." : "Sistem sudah normal kembali!";
    } catch (_) {
      if (st) st.textContent = "Belum dapat terhubung ke server. Coba lagi sebentar.";
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function fetchRemoteStatus() {
    const res = await gasPost({ action: "get_maintenance_v2" });
    if (res && res.config) {
      saveLocalConfig(res.config);
      if (!IS_ADMIN_ROUTE) {
        if (res.config.enabled) renderMaintenanceOverlay(res.config);
        else removeMaintenanceOverlay();
      }
      return res.config;
    }
    return readLocalConfig();
  }

  function renderAdminPortal() {
    injectStyles();
    const mount = () => {
      const loginScreen = document.getElementById("loginScreen");
      const appLayout = document.getElementById("appLayout");
      if (loginScreen) loginScreen.style.display = "none";
      if (appLayout) appLayout.style.display = "none";
      if (document.getElementById("jtpAdminPortal")) return;

      const wrap = document.createElement("div");
      wrap.id = "jtpAdminPortal";
      wrap.className = "jtp-maint-bg";
      wrap.innerHTML = `
        <div class="jtp-maint-card jtp-admin-card">
          <div style="text-align:center;">
            <img class="jtp-maint-logo" src="assets/logo-sekolah.jpg" alt="Logo SD Islam Ramah Anak" onerror="this.style.display='none'">
            <div class="jtp-maint-school">Panel Admin Maintenance · SD Islam Ramah Anak</div>
          </div>
          <div id="jtpAdminStatus" class="jtp-admin-alert">Masukkan sandi admin untuk mengatur status pemeliharaan.</div>

          <form id="jtpAdminLoginForm" style="display:${adminToken ? "none" : "block"};">
            <div class="jtp-admin-field">
              <label for="jtpAdminPassInput">Sandi Admin (Code.gs)</label>
              <input type="password" id="jtpAdminPassInput" placeholder="Masukkan sandi admin..." required autocomplete="current-password">
            </div>
            <button type="submit" id="jtpAdminLoginBtn" class="jtp-maint-btn" style="width:100%;">
              <i class="fa-solid fa-key"></i> Masuk ke Panel Admin
            </button>
          </form>

          <form id="jtpAdminControlForm" style="display:${adminToken ? "block" : "none"};">
            <label class="jtp-admin-toggle">
              <div>
                <strong style="font-size:13px;color:#fff;display:block;">Aktifkan Mode Maintenance</strong>
                <small style="font-size:11px;color:#94a3b8;">Mengunci aplikasi untuk seluruh guru secara real-time.</small>
              </div>
              <input type="checkbox" id="jtpAdminEnabled">
            </label>
            <div class="jtp-admin-field">
              <label for="jtpAdminMsg">Pesan Pemeliharaan untuk Guru</label>
              <textarea id="jtpAdminMsg" rows="3" placeholder="Contoh: Sedang ada pembaruan fitur di GitHub..."></textarea>
            </div>
            <div class="jtp-admin-field">
              <label for="jtpAdminEta">Perkiraan Selesai (Opsional)</label>
              <input type="text" id="jtpAdminEta" placeholder="Contoh: Pukul 16.30 WIB">
            </div>
            <div style="display:flex;gap:10px;">
              <button type="submit" id="jtpAdminSaveBtn" class="jtp-maint-btn" style="flex:1;">
                <i class="fa-solid fa-floppy-disk"></i> Simpan Pengaturan
              </button>
              <button type="button" id="jtpAdminLogoutBtn" class="jtp-maint-btn" style="background:rgba(255,255,255,0.1);box-shadow:none;">
                Keluar
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(wrap);

      const statusBox = document.getElementById("jtpAdminStatus");
      const loginForm = document.getElementById("jtpAdminLoginForm");
      const ctrlForm = document.getElementById("jtpAdminControlForm");

      function setAlert(msg, type = "") {
        if (!statusBox) return;
        statusBox.textContent = msg;
        statusBox.className = "jtp-admin-alert" + (type ? " " + type : "");
      }

      function fillControlForm(cfg) {
        document.getElementById("jtpAdminEnabled").checked = Boolean(cfg.enabled);
        document.getElementById("jtpAdminMsg").value = cfg.message || "";
        document.getElementById("jtpAdminEta").value = cfg.eta || "";
      }

      if (adminToken) {
        fetchRemoteStatus().then(fillControlForm).catch(() => fillControlForm(readLocalConfig()));
      }

      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("jtpAdminLoginBtn");
        const pass = document.getElementById("jtpAdminPassInput").value;
        btn.disabled = true;
        try {
          const res = await gasPost({ action: "admin_auth_v2", password: pass });
          adminToken = res.token;
          sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
          loginForm.style.display = "none";
          ctrlForm.style.display = "block";
          setAlert("Login admin berhasil.", "ok");
          const cfg = await fetchRemoteStatus();
          fillControlForm(cfg);
        } catch (err) {
          setAlert(err.message || "Sandi admin salah.", "err");
        } finally {
          btn.disabled = false;
        }
      });

      ctrlForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("jtpAdminSaveBtn");
        btn.disabled = true;
        setAlert("Menyimpan ke server...", "");
        try {
          const cfg = {
            enabled: document.getElementById("jtpAdminEnabled").checked,
            message: document.getElementById("jtpAdminMsg").value.trim(),
            eta: document.getElementById("jtpAdminEta").value.trim(),
            updatedAt: new Date().toISOString()
          };
          const res = await gasPost({ action: "admin_maintenance_v2", token: adminToken, config: cfg });
          saveLocalConfig(res.config);
          setAlert(res.config.enabled ? "Maintenance DIAKTIFKAN di seluruh perangkat guru." : "Maintenance DINONAKTIFKAN. Aplikasi kembali normal.", "ok");
        } catch (err) {
          setAlert(err.message || "Gagal menyimpan pengaturan.", "err");
          if (String(err.message).toLowerCase().includes("sesi")) {
            adminToken = "";
            sessionStorage.removeItem(ADMIN_TOKEN_KEY);
            ctrlForm.style.display = "none";
            loginForm.style.display = "block";
          }
        } finally {
          btn.disabled = false;
        }
      });

      document.getElementById("jtpAdminLogoutBtn").addEventListener("click", () => {
        adminToken = "";
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        ctrlForm.style.display = "none";
        loginForm.style.display = "block";
        setAlert("Sesi admin ditutup.", "");
      });
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }

  if (IS_ADMIN_ROUTE) {
    renderAdminPortal();
    return;
  }

  const cached = readLocalConfig();
  if (cached.enabled) renderMaintenanceOverlay(cached);

  fetchRemoteStatus().catch(() => {});
  setInterval(() => { fetchRemoteStatus().catch(() => {}); }, 10000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") fetchRemoteStatus().catch(() => {});
  });
})();