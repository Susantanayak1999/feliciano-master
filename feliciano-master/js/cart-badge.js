/* ============================================================
   CART BADGE — Shared across all pages
   Reads localStorage["cart"] and updates #nav-cart-count
   ============================================================ */

function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var count = 0;
    cart.forEach(function (item) {
        count += Number(item.quantity) || 0;
    });
    var el = document.getElementById('nav-cart-count');
    if (el) {
        el.textContent = count;
        el.setAttribute('data-count', count);
    }
}

// Update on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// Update when another tab changes the cart
window.addEventListener('storage', function (e) {
    if (e.key === 'cart') updateCartCount();
});