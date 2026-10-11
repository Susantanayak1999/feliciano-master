/* ============================================================
   CART BADGE — Hide for guests, hide when 0, show count only
   when logged in AND cart has items.
   ============================================================ */

(function () {
    "use strict";

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

    function updateCartCount() {
        var badge = document.getElementById("nav-cart-count");
        if (!badge) return;

        // 🔒 Not logged in → force count=0 and HIDE badge
        if (!isLoggedIn()) {
            badge.textContent = "0";
            badge.setAttribute("data-count", "0");
            badge.style.display = "none";
            badge.style.visibility = "hidden";
            badge.style.opacity = "0";
            return;
        }

        // Logged in → show real count (hide if 0)
        var count = getCartCount();
        badge.textContent = count;
        badge.setAttribute("data-count", count);

        if (count > 0) {
            badge.style.display = "";
            badge.style.visibility = "";
            badge.style.opacity = "";
        } else {
            badge.style.display = "none";
            badge.style.visibility = "hidden";
            badge.style.opacity = "0";
        }
    }

    // Clear stale cart if guest
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

    // Cross-tab sync
    window.addEventListener("storage", function (e) {
        if (e.key === "cart" || e.key === "token" || e.key === "user") {
            cleanStaleCart();
            updateCartCount();
        }
    });

    // Expose globally
    window.updateCartCount = updateCartCount;

})();