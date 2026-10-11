/* ============================================================
   CART BADGE — Shared across all pages
   Reads localStorage["cart"] and updates #nav-cart-count.
   Only shows the badge when a user is logged in AND cart has items.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Helpers ---------- */
    function isLoggedIn() {
        return !!localStorage.getItem("token") && !!localStorage.getItem("user");
    }

    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function getCartCount() {
        var cart = getCart();
        var count = 0;
        cart.forEach(function (item) {
            count += Number(item.quantity) || 0;
        });
        return count;
    }

    /* ---------- Update the badge in the navbar ---------- */
    function updateCartCount() {
        var badge = document.getElementById("nav-cart-count");
        if (!badge) return;

        // 🔒 Not logged in → force 0 and hide the badge
        if (!isLoggedIn()) {
            badge.textContent = "0";
            badge.setAttribute("data-count", "0");
            badge.style.display = "none";
            return;
        }

        // Logged in → show the real count (hide if 0)
        var count = getCartCount();
        badge.textContent = count;
        badge.setAttribute("data-count", count);

        if (count > 0) {
            badge.style.display = "";
        } else {
            badge.style.display = "none";
        }
    }

    /* ---------- Clear any leftover cart for guests ---------- */
    function cleanStaleCart() {
        if (!isLoggedIn()) {
            if (localStorage.getItem("cart")) {
                localStorage.removeItem("cart");
            }
        }
    }

    /* ---------- Init on page load ---------- */
    function boot() {
        cleanStaleCart();
        updateCartCount();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    /* ---------- Cross-tab sync ---------- */
    window.addEventListener("storage", function (e) {
        if (e.key === "cart" || e.key === "token" || e.key === "user") {
            cleanStaleCart();
            updateCartCount();
        }
    });

    /* ---------- Expose globally for other scripts ---------- */
    window.updateCartCount = updateCartCount;

})();