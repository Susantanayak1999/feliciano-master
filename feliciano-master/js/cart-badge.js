/* ============================================================
   CART BADGE — shared across pages
   Only shows when user is logged in AND cart has items.
   Exposes window.updateCartCount() for immediate live updates.
   ============================================================ */

(function () {
    "use strict";

    function isLoggedIn() {
        return !!localStorage.getItem("token") && !!localStorage.getItem("user");
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem("cart")) || [];
        } catch (e) {
            return [];
        }
    }

    function getCartCount() {
        var cart = getCart();
        var count = 0;
        cart.forEach(function (item) {
            count += Number(item.quantity) || 0;
        });
        return count;
    }

    function updateCartCount() {
        var badge = document.getElementById("nav-cart-count");
        if (!badge) return;

        // Not logged in → hide badge
        if (!isLoggedIn()) {
            badge.textContent = "0";
            badge.setAttribute("data-count", "0");
            badge.style.display = "none";
            return;
        }

        var count = getCartCount();
        badge.textContent = count;
        badge.setAttribute("data-count", count);

        if (count > 0) {
            badge.style.display = "";           // show
            badge.style.visibility = "visible";
            badge.style.opacity = "1";
        } else {
            badge.style.display = "none";       // hide
        }
    }

    function cleanStaleCart() {
        if (!isLoggedIn()) {
            if (localStorage.getItem("cart")) {
                localStorage.removeItem("cart");
            }
        }
    }

    function boot() {
        cleanStaleCart();
        updateCartCount();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    // 🌟 Expose globally BEFORE other scripts may need it
    window.updateCartCount = updateCartCount;

    // Cross-tab sync
    window.addEventListener("storage", function (e) {
        if (e.key === "cart" || e.key === "token" || e.key === "user") {
            cleanStaleCart();
            updateCartCount();
        }
    });

})();