// ===== Global Cart Functionality =====
document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Initialize cart count from localStorage
    updateCartCount();

    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-cart, .btn-add-cart-detail');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const product = this.dataset.product || 'Product';
            const price = parseFloat(this.dataset.price) || 0;

            // Get quantity if on detail page
            let quantity = 1;
            const qtyInput = document.getElementById('quantity');
            if (qtyInput) {
                quantity = parseInt(qtyInput.value) || 1;
            }

            addToCart(product, price, quantity);
        });
    });

    // Quantity selector buttons
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.getElementById('quantity');

    if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', function () {
            let value = parseInt(qtyInput.value) || 1;
            if (value > 1) qtyInput.value = value - 1;
        });
    }
    if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', function () {
            let value = parseInt(qtyInput.value) || 1;
            if (value < 99) qtyInput.value = value + 1;
        });
    }

    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    // Format expiry date
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
            e.target.value = value;
        });
    }

    // CVV input - numbers only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // Load last order if on confirmation page
    if (window.location.pathname.includes('confirmation.html')) loadConfirmation();
});

// ===== Cart Functions =====
function addToCart(product, price, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find(item => item.product === product);
    if (existingItem) existingItem.quantity += quantity;
    else cart.push({ product, price, quantity });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    alert(`✅ Added to cart: ${product} (${quantity}x)`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => el.textContent = totalItems);
}

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}

// ===== Payment Validation =====
function validatePayment(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    let isValid = true;
    clearErrors();

    if (!fullName.value.trim()) {
        showError('nameError', 'Full name is required'); fullName.classList.add('error'); isValid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError('emailError', 'Valid email required'); email.classList.add('error'); isValid = false;
    }
    const cardNumClean = cardNumber.value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumClean)) { showError('cardError', 'Card must be 16 digits'); cardNumber.classList.add('error'); isValid = false; }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate.value)) { showError('expiryError', 'Use MM/YY'); expiryDate.classList.add('error'); isValid = false; }
    else {
        const [month, year] = expiryDate.value.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
            showError('expiryError', 'Card expired'); expiryDate.classList.add('error'); isValid = false;
        }
    }

    if (!/^\d{3,4}$/.test(cvv.value)) { showError('cvvError', 'CVV 3-4 digits'); cvv.classList.add('error'); isValid = false; }

    if (isValid) {
        const orderNum = 'URB-' + Math.floor(Math.random() * 9000 + 1000) + '-' + new Date().getFullYear();
        localStorage.setItem('lastOrder', JSON.stringify({
            number: orderNum,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            total: `$${getCartTotal()}`,
            name: fullName.value,
            card: '•••• ' + cardNumClean.slice(-4)
        }));
        localStorage.removeItem('cart');
        updateCartCount();
        window.location.href = 'confirmation.html';
    }
    return false;
}

function showError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErrors() { document.querySelectorAll('.error-message').forEach(el => el.textContent = ''); document.querySelectorAll('.error').forEach(el => el.classList.remove('error')); }

// ===== Billing Address Toggle =====
function toggleBillingAddress() {
    const checkbox = document.getElementById('sameAsShipping');
    const fields = document.getElementById('billingAddressFields');
    if (fields) fields.style.display = checkbox.checked ? 'none' : 'block';
}

// ===== Confirmation Page Load =====
function loadConfirmation() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (!lastOrder) return;

    const map = {
        '.order-number strong': lastOrder.number,
        '.order-date strong': lastOrder.date,
        '.order-total strong': lastOrder.total,
        '.payment-method-confirm strong': `<i class="fab fa-cc-visa"></i> ${lastOrder.card}`,
        '.shipping-info p': `${lastOrder.name}<br>123 Tech Street<br>San Francisco, CA 94105<br>United States`
    };

    for (let selector in map) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = map[selector];
    }
}

// ===== Product Image Gallery =====
function changeImage(src) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) mainImage.src = src;

    document.querySelectorAll('.thumbnail-images img').forEach(thumb => {
        thumb.classList.toggle('active-thumb', thumb.src === src);
    });
}

// ===== Product Specs Tabs =====
function showTab(tabName) {
    document.querySelectorAll('.specs-content').forEach(c => c.classList.remove('active'));
    const tab = document.getElementById(tabName + '-tab');
    if (tab) tab.classList.add('active');

    document.querySelectorAll('.spec-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(tabName) ||
            (tabName === 'details' && btn.textContent === 'Details') ||
            (tabName === 'specs' && btn.textContent === 'Specifications') ||
            (tabName === 'reviews' && btn.textContent === 'Reviews')) {
            btn.classList.add('active');
        }
    });
}
