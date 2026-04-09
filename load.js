// load.js
document.addEventListener('DOMContentLoaded', () => {
    // Load header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // Re-run mobile menu binding after header loads
            initMobileMenu();
            // Update active nav link based on current page
            setActiveNavLink();
            // Re-attach cart count update
            updateCartCount();
        });

    // Load footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
});

function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenu && navMenu) {
        // Remove any existing listener to avoid duplicates
        mobileMenu.replaceWith(mobileMenu.cloneNode(true));
        const newMobileMenu = document.getElementById('mobile-menu');
        newMobileMenu.addEventListener('click', () => {
            newMobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = {
        'index.html': 'nav-home',
        'products.html': 'nav-products',
        'detail.html': 'nav-detail',
        'checkout.html': 'nav-checkout',
        'confirmation.html': 'nav-confirmation'
    };
    const activeId = navLinks[currentPath];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) activeLink.classList.add('active');
    }
}

// Cart functions (must be available globally)
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(product, price, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.product === product);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ product, price: parseFloat(price), quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`✅ Added to cart: ${product} (${quantity}x)`);
}