// ===== Global Cart Functionality =====
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Initialize cart count from localStorage
    updateCartCount();

    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-cart, .btn-add-cart-detail');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const product = this.dataset.product || 'Product';
            const price = this.dataset.price || '0';
            
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
        minusBtn.addEventListener('click', function() {
            let value = parseInt(qtyInput.value) || 1;
            if (value > 1) {
                qtyInput.value = value - 1;
            }
        });
    }
    
    if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', function() {
            let value = parseInt(qtyInput.value) || 1;
            if (value < 10) {
                qtyInput.value = value + 1;
            }
        });
    }

    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }

    // Format expiry date
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            
            e.target.value = value;
        });
    }

    // CVV input - numbers only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }
});

// ===== Cart Functions =====
function addToCart(product, price, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.product === product);
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            product: product,
            price: parseFloat(price),
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show feedback
    alert(`✅ Added to cart: ${product} (${quantity}x)`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = totalItems;
    });
}

// ===== Payment Validation =====
function validatePayment(event) {
    event.preventDefault();
    
    // Get form fields
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate Full Name
    if (!fullName.value.trim()) {
        showError('nameError', 'Full name is required');
        fullName.classList.add('error');
        isValid = false;
    } else {
        fullName.classList.remove('error');
    }
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError('emailError', 'Email is required');
        email.classList.add('error');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError('emailError', 'Please enter a valid email address');
        email.classList.add('error');
        isValid = false;
    } else {
        email.classList.remove('error');
    }
    
    // Validate Card Number
    const cardNumberClean = cardNumber.value.replace(/\s/g, '');
    if (!cardNumber.value.trim()) {
        showError('cardError', 'Card number is required');
        cardNumber.classList.add('error');
        isValid = false;
    } else if (!/^\d{16}$/.test(cardNumberClean)) {
        showError('cardError', 'Card number must be 16 digits');
        cardNumber.classList.add('error');
        isValid = false;
    } else {
        cardNumber.classList.remove('error');
    }
    
    // Validate Expiry Date
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
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
            showError('expiryError', 'Month must be 01-12');
            expiryDate.classList.add('error');
            isValid = false;
        } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            showError('expiryError', 'Card has expired');
            expiryDate.classList.add('error');
            isValid = false;
        } else {
            expiryDate.classList.remove('error');
        }
    }
    
    // Validate CVV
    if (!cvv.value.trim()) {
        showError('cvvError', 'CVV is required');
        cvv.classList.add('error');
        isValid = false;
    } else if (!/^\d{3,4}$/.test(cvv.value)) {
        showError('cvvError', 'CVV must be 3 or 4 digits');
        cvv.classList.add('error');
        isValid = false;
    } else {
        cvv.classList.remove('error');
    }
    
    // If valid, redirect to confirmation
    if (isValid) {
        // Generate random order number
        const orderNum = 'URB-' + Math.floor(Math.random() * 9000 + 1000) + '-' + new Date().getFullYear();
        
        // Store order info
        localStorage.setItem('lastOrder', JSON.stringify({
            number: orderNum,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            total: '$325.49',
            name: fullName.value,
            card: '•••• ' + cardNumberClean.slice(-4)
        }));
        
        // Clear cart after successful purchase
        localStorage.removeItem('cart');
        updateCartCount();
        
        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    }
    
    return false;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => {
        el.textContent = '';
    });
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(el => {
        el.classList.remove('error');
    });
}

// ===== Billing Address Toggle =====
function toggleBillingAddress() {
    const checkbox = document.getElementById('sameAsShipping');
    const billingFields = document.getElementById('billingAddressFields');
    
    if (billingFields) {
        billingFields.style.display = checkbox.checked ? 'none' : 'block';
    }
}

// ===== Load Order Info on Confirmation Page =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if on confirmation page
    if (window.location.pathname.includes('confirmation.html')) {
        const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
        
        if (lastOrder) {
            // Update order info
            const orderNumberEl = document.querySelector('.order-number strong');
            const orderDateEl = document.querySelector('.order-date strong');
            const orderTotalEl = document.querySelector('.order-total strong');
            const paymentMethodEl = document.querySelector('.payment-method-confirm strong');
            
            if (orderNumberEl) orderNumberEl.textContent = lastOrder.number;
            if (orderDateEl) orderDateEl.textContent = lastOrder.date;
            if (orderTotalEl) orderTotalEl.textContent = lastOrder.total;
            if (paymentMethodEl) {
                paymentMethodEl.innerHTML = `<i class="fab fa-cc-visa"></i> ${lastOrder.card}`;
            }
            
            // Update shipping address
            const shippingInfo = document.querySelector('.shipping-info p');
            if (shippingInfo && lastOrder.name) {
                shippingInfo.innerHTML = `${lastOrder.name}<br>123 Tech Street<br>San Francisco, CA 94105<br>United States`;
            }
        }
    }
});

// ===== Product Image Gallery =====
function changeImage(src) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = src;
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll('.thumbnail-images img');
        thumbnails.forEach(thumb => {
            thumb.classList.remove('active-thumb');
            if (thumb.src === src) {
                thumb.classList.add('active-thumb');
            }
        });
    }
}

// ===== Product Specs Tabs =====
function showTab(tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.specs-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update active button
    const tabButtons = document.querySelectorAll('.spec-tab');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName) || 
            (tabName === 'details' && button.textContent === 'Details') ||
            (tabName === 'specs' && button.textContent === 'Specifications') ||
            (tabName === 'reviews' && button.textContent === 'Reviews')) {
            button.classList.add('active');
        }
    });
}