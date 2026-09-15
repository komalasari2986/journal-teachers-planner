/* ======================================================
   KONTROL MODE MAINTENANCE / PEMELIHARAAN SISTEM
   - Ubah `IS_MAINTENANCE` ke `true` jika sedang perbaikan
   - Ubah `IS_MAINTENANCE` ke `false` jika berjalan normal
   ====================================================== */
var IS_MAINTENANCE = true; // <-- Gunakan var agar terbaca di window global
var MAINTENANCE_BYPASS_KEY = "admin123";
