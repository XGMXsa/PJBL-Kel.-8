document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // Fitur Toggle Lihat/Sembunyikan Password
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // Event Listener untuk Login Manual (Username & Password)
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = passwordInput.value;

            // Reset pesan error setiap kali tombol login ditekan ulang
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';

            submitBtn.querySelector('span').textContent = 'Verifying...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('userName', data.user.username);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
                } else {
                    errorMessage.textContent = data.error || 'Username atau Password salah!';
                    errorMessage.style.display = 'block';

                    submitBtn.querySelector('span').textContent = 'Login';
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                errorMessage.textContent = 'Tidak dapat terhubung ke server backend.';
                errorMessage.style.display = 'block';

                submitBtn.querySelector('span').textContent = 'Login';
                submitBtn.disabled = false;
            }
        });
    }
});

// ==========================================
// FUNGSI GLOBAL UNTUK GOOGLE SSO CALLBACK
// (Harus berada di luar DOMContentLoaded)
// ==========================================
async function handleCredentialResponse(response) {
    const errorMessage = document.getElementById('errorMessage');
    
    // Reset pesan error
    if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    try {
        const res = await fetch('http://localhost:5000/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            // Simpan nama user ke localStorage lalu arahkan ke dashboard
            localStorage.setItem('userName', data.user.username);
            window.location.href = 'dashboard.html';
        } else {
            if (errorMessage) {
                errorMessage.textContent = data.error || 'Gagal login via Google.';
                errorMessage.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Google Login Fetch Error:', err);
        if (errorMessage) {
            errorMessage.textContent = 'Terjadi kesalahan saat verifikasi Google.';
            errorMessage.style.display = 'block';
        }
    }
}