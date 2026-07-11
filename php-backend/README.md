# PRO Care Homes - Production Deployment Guide
### React SPA (Vite + TS) + Native PHP 8.x/MySQL Backend
### Targeted for: Hostinger Premium Shared Hosting (Apache, PHP, MySQL)

This application is engineered with a hybrid architecture consisting of a high-performance, responsive **React + Vite + TypeScript** frontend combined with a native, highly secure **PHP + MySQL** backend. 

Hostinger Premium Shared Hosting does not support running persistent Node.js/Express servers. This backend has been fully rewritten in native PHP, enabling 100% serverless, standard web hosting execution with zero background processes, while keeping the React SPA fully active and secure.

---

## 🏛️ Architecture & Routing Map

1. **Static Files**: Serves compiled HTML, JavaScript, CSS, and media assets out of `public_html/`.
2. **API Gateways**: All core client form-submissions and AI chat queries are routed to `/api/` matching native endpoints:
   - `/api/assistant` ➔ mapped securely to `api/assistant.php` (Google Gemini AI)
   - `/api/referral` ➔ mapped securely to `api/referral.php` (Local Authority Referrals)
   - `/api/contact` ➔ mapped securely to `api/contact.php` (General Family Inquiries)
3. **Apache Rewrite Engine (`.htaccess`)**:
   - Forces incoming client requests destined for `/api/*` to route to their respective PHP files.
   - Forwards all remaining non-file, non-directory routes to `/index.html`, allowing React's client-side Router to manage the application's view state natively.

---

## 📦 Directory Structure

At compile-time (`npm run build`), Vite automatically packages the client and the PHP files into a consolidated `/dist` directory:

```text
/dist/
├── assets/                     # Compiled React static CSS, JS, and Images
├── api/                        # Native PHP Backend Subsystem
│   ├── config.php              # Centralized configuration (DB credentials & API keys)
│   ├── db.php                  # Secure PDO/MySQL connection wrapper
│   ├── assistant.php           # Server-side Gemini AI interface (native PHP cURL)
│   ├── referral.php            # Secure LA referral validation & DB writing
│   └── contact.php             # Secure family inquiry validation & DB writing
├── .htaccess                   # Apache routing and rewrite instructions
├── index.html                  # Main React Entry Point
└── logo.svg                    # Vector graphic branding
```

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Compile the React Application
In your terminal, navigate to the project root directory and execute the production build script:
```bash
npm run build
```
This compiles the TypeScript code, bundles Tailwind styles, and copies all static files along with the entire `/api/` folder and the `.htaccess` configuration into the `/dist` directory.

### Step 2: Establish the MySQL Database on Hostinger
1. Log into your **Hostinger hPanel**.
2. Navigate to **Databases** ➔ **MySQL Databases**.
3. Create a new database:
   - **Database Name**: e.g., `u123456789_pro_care`
   - **MySQL Username**: e.g., `u123456789_admin`
   - **Password**: *Create a strong, secure password*
4. Click **Create**.

### Step 3: Import the SQL Schema
1. Inside Hostinger hPanel under MySQL Databases, find your new database and click **Enter phpMyAdmin**.
2. Go to the **Import** tab.
3. Click **Choose File** and select the `/php-backend/schema.sql` file from this project.
4. Click **Go** (or **Import** at the bottom). 
   - *This creates the `referrals` and `inquiries` tables with precise index optimizations.*

### Step 4: Upload Compiled Files to Hostinger
1. In Hostinger hPanel, go to **Files** ➔ **File Manager**.
2. Open the **`public_html`** directory (this is your website root).
3. Open your local `/dist` directory.
4. Upload all contents of the `/dist` directory (not the `/dist` folder itself, but the files and folders *inside* `/dist`) directly into Hostinger's `/public_html/`.
   - *You can compress the contents of `/dist` into a `.zip` file, upload the `.zip`, and extract it directly inside the File Manager for rapid upload.*

### Step 5: Configure Credentials on the Server
For maximum security, database credentials and API tokens must be defined securely on the server.

1. In the Hostinger File Manager, open **`public_html/api/config.php`**.
2. Locate the configuration return array:
```php
return [
    'db' => [
        'host'     => 'localhost',              // Usually 'localhost' or '127.0.0.1' in Hostinger
        'port'     => '3306',
        'database' => 'u123456789_pro_care',    // Paste your Hostinger DB Name here
        'username' => 'u123456789_admin',       // Paste your Hostinger DB User here
        'password' => 'YOUR_SECURE_PASSWORD'    // Paste your Hostinger DB Password here
    ],
    'gemini' => [
        'api_key' => 'AIzaSy...'               // Paste your Google Gemini API Key here
    ]
];
```
3. Update the fields with your actual Hostinger details and Google Gemini API key.
4. Save and close the file.

---

## 🔒 Security Best Practices & Configuration

* **PDO Prepared Statements**: The backend relies exclusively on PDO prepared queries with parameterized inputs. This entirely prevents SQL Injection (SQLi) vulnerabilities.
* **Input Sanitization**: Inbound strings are filtered via `htmlspecialchars` and email fields are verified with `FILTER_VALIDATE_EMAIL` to mitigate Cross-Site Scripting (XSS) and code injection threats.
* **Muted Error Reporting**: In production mode (when running outside of `localhost`), PHP errors, warnings, and stack traces are automatically suppressed to avoid leaking paths, passwords, or system architectures to users.
* **CORS Restrictions**: CORS configurations in `config.php` default to same-origin. If you are serving the frontend from a different subdomain/port, add the origin to the `$allowedOrigins` array in `config.php`.

---

## 🛠️ Troubleshooting & Diagnostics

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **404 Error on Page Refresh** | Apache's Rewrite engine is not active or `.htaccess` is missing. | Verify that `.htaccess` is present in the `public_html/` root folder and that Hostinger has `mod_rewrite` enabled (default on Premium Shared accounts). |
| **500 Database Error** | Invalid credentials or missing tables. | Double check database user passwords and host names in `api/config.php`. Ensure you successfully imported `schema.sql` via phpMyAdmin. |
| **Gemini AI fails to respond** | Outdated or missing Gemini API Key, or cURL is disabled. | Open `api/config.php` and make sure your key is populated correctly. Ensure `php-curl` extension is enabled in Hostinger's PHP configuration settings (enabled by default). |
| **CORS / Preflight blocks** | Missing CORS headers on external requests. | Ensure your clients are hitting endpoints using the exact domain name configured. Adjust `$allowedOrigins` inside `api/config.php` if accessing from separate staging URLs. |
