// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Add to Cart buttons (delegation because buttons are loaded dynamically)
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart') || e.target.closest('.btn-add-cart')) {
            const btn = e.target.closest('.btn-add-cart');
            e.preventDefault();
            const product = btn.dataset.product || 'Product';
            const price = btn.dataset.price || '0';
            let quantity = 1;
            const qtyInput = document.getElementById('quantity');
            if (qtyInput) quantity = parseInt(qtyInput.value) || 1;
            addToCart(product, price, quantity);
        }
    });

    // Quantity selector buttons (if on detail page)
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.getElementById('quantity');
    if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }
    if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val < 10) qtyInput.value = val + 1;
        });
    }

    // Format card number
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/\s/g, '');
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += val[i];
            }
            e.target.value = formatted;
        });
    }

    // Format expiry
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
            e.target.value = val;
        });
    }

    // CVV digits only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0,4);
        });
    }
});

// Global validation function
function validatePayment(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    let isValid = true;
    clearErrors();

    // Full name
    if (!fullName.value.trim()) {
        showError('nameError', 'Full name is required');
        fullName.classList.add('error');
        isValid = false;
    } else fullName.classList.remove('error');

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError('emailError', 'Email is required');
        email.classList.add('error');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError('emailError', 'Enter a valid email');
        email.classList.add('error');
        isValid = false;
    } else email.classList.remove('error');

    // Card number (16 digits, allow spaces)
    const cardClean = cardNumber.value.replace(/\s/g, '');
    if (!cardNumber.value.trim()) {
        showError('cardError', 'Card number is required');
        cardNumber.classList.add('error');
        isValid = false;
    } else if (!/^\d{16}$/.test(cardClean)) {
        showError('cardError', 'Card number must be 16 digits');
        cardNumber.classList.add('error');
        isValid = false;
    } else cardNumber.classList.remove('error');

    // Expiry Date – FIXED: now rejects expired cards
    if (!expiryDate.value.trim()) {
        showError('expiryError', 'Expiry date is required');
        expiryDate.classList.add('error');
        isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate.value)) {
        showError('expiryError', 'Use format MM/YY');
        expiryDate.classList.add('error');
        isValid = false;
    } else {
        const [month, year] = expiryDate.value.split('/');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (monthNum < 1 || monthNum > 12) {
            showError('expiryError', 'Month must be 01-12');
            expiryDate.classList.add('error');
            isValid = false;
        } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
            showError('expiryError', 'Card has expired');
            expiryDate.classList.add('error');
            isValid = false;
        } else {
            expiryDate.classList.remove('error');
        }
    }

    // CVV (3 or 4 digits)
    if (!cvv.value.trim()) {
        showError('cvvError', 'CVV is required');
        cvv.classList.add('error');
        isValid = false;
    } else if (!/^\d{3,4}$/.test(cvv.value)) {
        showError('cvvError', 'CVV must be 3 or 4 digits');
        cvv.classList.add('error');
        isValid = false;
    } else cvv.classList.remove('error');

    if (isValid) {
        const orderNum = 'URB-' + Math.floor(Math.random() * 9000 + 1000) + '-' + new Date().getFullYear();
        localStorage.setItem('lastOrder', JSON.stringify({
            number: orderNum,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            total: '$325.49',
            name: fullName.value,
            card: '•••• ' + cardClean.slice(-4)
        }));
        localStorage.removeItem('cart');
        updateCartCount();
        window.location.href = 'confirmation.html';
    }
    return false;
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// Toggle billing address
function toggleBillingAddress() {
    const checkbox = document.getElementById('sameAsShipping');
    const billingFields = document.getElementById('billingAddressFields');
    if (billingFields) {
        billingFields.style.display = checkbox.checked ? 'none' : 'block';
    }
}

// On confirmation page: load order details
if (window.location.pathname.includes('confirmation.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
        if (lastOrder) {
            const orderNumEl = document.querySelector('.order-number strong');
            const orderDateEl = document.querySelector('.order-date strong');
            const orderTotalEl = document.querySelector('.order-total strong');
            const paymentMethodEl = document.querySelector('.payment-method-confirm strong');
            if (orderNumEl) orderNumEl.textContent = lastOrder.number;
            if (orderDateEl) orderDateEl.textContent = lastOrder.date;
            if (orderTotalEl) orderTotalEl.textContent = lastOrder.total;
            if (paymentMethodEl) paymentMethodEl.innerHTML = `<i class="fab fa-cc-visa"></i> ${lastOrder.card}`;
            const shippingInfo = document.querySelector('.shipping-info p');
            if (shippingInfo && lastOrder.name) {
                shippingInfo.innerHTML = `${lastOrder.name}<br>123 Tech Street<br>San Francisco, CA 94105<br>United States`;
            }
        }
    });
}

// Image gallery and specs tabs (for detail.html)
function changeImage(src) {
    const main = document.getElementById('mainProductImage');
    if (main) main.src = src;
    document.querySelectorAll('.thumbnail-images img').forEach(thumb => {
        thumb.classList.remove('active-thumb');
        if (thumb.src === src) thumb.classList.add('active-thumb');
    });
}

function showTab(tabName) {
    document.querySelectorAll('.specs-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelectorAll('.spec-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}