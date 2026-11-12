const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Konfigurasi Database PostgreSQL (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 2. Konfigurasi Google Client ID
const CLIENT_ID = '74528517098-n29pe4c4f57kcvp85f0ereef9b93sdfg.apps.googleusercontent.com';
const googleClient = new OAuth2Client(CLIENT_ID);

// 3. Endpoint Google Login
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        // Verifikasi token dari frontend menggunakan google-auth-library
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;

        // Cek apakah user sudah terdaftar di database
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        let user;
        if (userResult.rows.length > 0) {
            // Jika user sudah ada, ambil datanya
            user = userResult.rows.log ? userResult.rows[0] : userResult.rows[0];
        } else {
            // Jika belum ada, daftarkan otomatis ke database
            // (Sesuaikan nama kolom tabel users Anda, misal: username, email, password)
            const insertResult = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [name, email, 'GOOGLE_AUTH_USER'] // Password dummy karena login via Google
            );
            user = insertResult.rows[0];
        }

        // Kirim respon sukses ke frontend
        res.status(200).json({
            message: 'Login Google berhasil',
            user: {
                username: user.username || name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ error: 'Gagal memverifikasi token Google.' });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server backend berjalan di port ${PORT}`);
});