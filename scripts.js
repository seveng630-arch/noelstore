const pos = (() => {
    // 1. Data Harga Produk Baju
    const catalog = [
        { id: 1, name: 'Kaos Oversize Noel', price: 150000, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
        { id: 2, name: 'Hoodie Premium Noel', price: 350000, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
        { id: 3, name: 'Jaket Parasut Noel', price: 450000, img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&q=80' },
        { id: 4, name: 'Celana Cargo Noel', price: 250000, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80' }
    ];

    let cart = [];

    const formatRp = (angka) => 'Rp ' + angka.toLocaleString('id-ID').replace(/,/g, '.');

    // 2. Alur Animasi Splash Screen (DIPERBAIKI)
    const initApp = () => {
        renderCatalog();
        
        const splash = document.getElementById('splash-screen');
        
        // Memulai timer 3 detik langsung tanpa menunggu gambar loading
        setTimeout(() => {
            // Trigger animasi fade-out via CSS
            splash.classList.add('fade-out');
            
            // Tunggu 800ms sampai animasi fade-out CSS selesai
            setTimeout(() => {
                splash.style.display = 'none'; // Hapus splash screen dari layar
                switchScreen('menu-screen');   // Munculkan menu utama
            }, 800);
            
        }, 3000);
    };

    // Navigasi Layar 
    const switchScreen = (screenId) => {
        // Sembunyikan semua layar
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        // Munculkan layar yang dituju
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    };

    const goToMenu = () => switchScreen('menu-screen');
    
    const goToCheckout = () => {
        renderCheckout();
        switchScreen('checkout-screen');
    };

    // Render Grid Produk
    const renderCatalog = () => {
        const container = document.getElementById('product-catalog');
        if(!container) return;

        container.innerHTML = catalog.map(item => `
            <div class="product-card" onclick="pos.addToCart(${item.id})">
                <div class="product-img-wrapper">
                    <img src="${item.img}" alt="${item.name}" class="product-image" loading="lazy">
                </div>
                <h3 class="product-name">${item.name}</h3>
                <p class="product-price">${formatRp(item.price)}</p>
                <button class="btn-secondary full-width">ADD TO CART</button>
            </div>
        `).join('');
    };

    // Logika Cart
    const addToCart = (id) => {
        const product = catalog.find(p => p.id === id);
        cart.push(product);
        updateCartHeader();
    };

    const getTotal = () => cart.reduce((sum, item) => sum + item.price, 0);

    const updateCartHeader = () => {
        document.getElementById('cart-qty').innerText = cart.length;
        document.getElementById('cart-total').innerText = formatRp(getTotal());
    };

    const renderCheckout = () => {
        const summary = document.getElementById('order-summary');
        if (cart.length === 0) {
            summary.innerHTML = '<p style="color: var(--text-muted); font-weight: 700;">Cart is empty.</p>';
            return;
        }

        let html = '<h3 style="font-size: 24px; font-weight: 900; margin-bottom: 20px;">ORDER SUMMARY</h3>';
        cart.forEach(item => {
            html += `<div class="summary-row"><span>${item.name}</span><span>${formatRp(item.price)}</span></div>`;
        });
        html += `<div class="summary-row total"><span>TOTAL</span><span>${formatRp(getTotal())}</span></div>`;
        
        summary.innerHTML = html;
        document.getElementById('cash-input').value = '';
        document.getElementById('error-msg').innerText = '';
    };

    // 3. Logika Kasir & Nota Pembayaran
    const processTransaction = () => {
        if (cart.length === 0) {
            document.getElementById('error-msg').innerText = 'CART IS EMPTY!';
            return;
        }
        
        const cashInput = document.getElementById('cash-input').value;
        const cashGiven = parseInt(cashInput);
        const totalCost = getTotal();

        if (cashInput === '' || isNaN(cashGiven) || cashGiven < totalCost) {
            document.getElementById('error-msg').innerText = 'INSUFFICIENT PAYMENT AMOUNT.';
            return;
        }

        const change = cashGiven - totalCost;
        generateReceipt(totalCost, cashGiven, change);
    };

    const generateReceipt = (total, cash, change) => {
        const pad = (text, length) => text.padEnd(length, ' ');
        
        let receipt = `Uraian pembelian\n`;
        cart.forEach(item => {
            receipt += `${pad(item.name, 23)}${formatRp(item.price)}\n`;
        });
        
        receipt += `${pad('Total', 23)}${formatRp(total)}\n`;
        receipt += `${pad('Uang', 23)}${formatRp(cash)}\n`;
        receipt += `${pad('Kembalian', 23)}${formatRp(change)}\n`;

        document.getElementById('receipt-text').innerHTML = `<pre>${receipt}</pre>`;
        document.getElementById('receipt-modal').classList.add('show');
    };

    // Reset dan Mulai Ulang
    const finishAndReset = () => {
        cart = [];
        updateCartHeader();
        document.getElementById('receipt-modal').classList.remove('show');
        
        const splash = document.getElementById('splash-screen');
        
        // Kembalikan elemen splash screen ke layar
        splash.style.display = 'flex';
        
        // Beri jeda sangat singkat agar browser merender flexbox sebelum merubah opacity
        requestAnimationFrame(() => {
            splash.classList.remove('fade-out');
            
            // Sembunyikan layar yang aktif (checkout/menu)
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // Ulangi alur animasi pembuka
            setTimeout(() => {
                splash.classList.add('fade-out');
                setTimeout(() => {
                    splash.style.display = 'none';
                    switchScreen('menu-screen');
                }, 800);
            }, 3000);
        });
    };

    // FIX: Menggunakan DOMContentLoaded agar eksekusi tidak tertahan loading gambar internet
    document.addEventListener('DOMContentLoaded', initApp);

    // Mengekspos fungsi agar bisa dipanggil dari HTML onclick
    return { goToMenu, goToCheckout, addToCart, processTransaction, finishAndReset };
})();