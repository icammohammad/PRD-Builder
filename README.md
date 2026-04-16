# AI PRD Architect

Aplikasi AI untuk mentransformasikan ide mentah menjadi dokumen spesifikasi produk (PRD) yang profesional menggunakan Gemini 2.0.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion
- **Backend**: Express.js
- **Database**: Prisma ORM with SQLite (default) / MySQL
- **AI**: Google Gemini 2.0 API

---

## 1. Instalasi di Lokal (Windows/Mac/Linux)

### Prasyarat
- Node.js (v18 atau lebih baru)
- npm atau yarn

### Langkah-langkah
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ai-prd-architect
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi variabel berikut di dalam `.env`:
   - `GEMINI_API_KEY`: Dapatkan dari [Google AI Studio](https://aistudio.google.com/).
   - `DATABASE_URL`: Default menggunakan SQLite (`file:./dev.db`). Jika ingin menggunakan MySQL, ubah menjadi `mysql://user:password@localhost:3306/db_name`.
   - `JWT_SECRET`: String acak untuk keamanan token.

4. **Setup Database**
   Jalankan migrasi Prisma untuk membuat tabel:
   ```bash
   npx prisma db push
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 2. Deployment di VPS Ubuntu dengan Nginx

### Prasyarat
- VPS dengan Ubuntu 20.04/22.04
- Domain yang sudah diarahkan ke IP VPS
- Akses SSH

### Langkah-langkah

1. **Update Sistem & Instal Node.js**
   ```bash
   sudo apt update
   sudo apt install -y curl git nginx
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Instal PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

3. **Setup Aplikasi**
   ```bash
   cd /var/www
   sudo git clone <repository-url> prd-app
   sudo chown -R $USER:$USER prd-app
   cd prd-app
   npm install
   ```

4. **Konfigurasi Environment & Build**
   - Buat file `.env` dan isi seperti instruksi lokal.
   - Jalankan build:
     ```bash
     npx prisma db push
     npm run build
     ```

5. **Jalankan dengan PM2**
   ```bash
   pm2 start server.ts --name "prd-app" --interpreter tsx
   pm2 save
   pm2 startup
   ```

6. **Konfigurasi Nginx sebagai Reverse Proxy**
   Buat file konfigurasi nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/prd-app
   ```
   Masukkan konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name domain-anda.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/prd-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL (Opsional tapi Disarankan)**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d domain-anda.com
   ```

---

## Catatan Penting
- **Admin Pertama**: Pengguna pertama yang mendaftar dengan email `muhammad.hissamudin@gmail.com` akan otomatis menjadi Admin.
- **Keamanan**: Pastikan port 3000 tidak terbuka untuk publik di firewall (ufw), biarkan Nginx yang menangani akses melalui port 80/443.
