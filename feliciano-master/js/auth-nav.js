/* ============================================================
   AUTH NAV — Login button + Cart icon + mobile layout
   Order: [ Cart ] • [ Login ]
   ============================================================ */

(function () {
    "use strict";

    const LOGIN_PAGE = "login.html";

    /* ============================================================
       1. INIT — Insert the auth button into the navbar
       ============================================================ */
    function init() {
        const navList = document.querySelector(".ftco-navbar-light .navbar-nav");
        if (!navList) return;
        if (document.getElementById("authNavItem")) return;

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const li = document.createElement("li");
        li.className = "nav-item cta auth-btn";
        li.id = "authNavItem";

        if (user) {
            // ---------- LOGGED IN ----------
            const firstName = (user.name || "User").split(" ")[0];
            li.innerHTML = `
                <a href="#" class="nav-link" id="authNavLink">
                    <span class="ion-ios-person"></span> ${firstName}
                    <span style="opacity:.75;font-size:10px;">▼</span>
                </a>
                <ul class="auth-dropdown" id="authDropdown">
                    <li><a href="my-orders.html">My Orders</a></li>
                    <li><a href="#" id="logoutBtn">Sign Out</a></li>
                </ul>
            `;

            const cartBtn = navList.querySelector(".cart-btn");
            if (cartBtn && cartBtn.parentNode) {
                cartBtn.parentNode.insertBefore(li, cartBtn.nextSibling);
            } else {
                navList.appendChild(li);
            }

            const link = li.querySelector("#authNavLink");
            const dropdown = li.querySelector("#authDropdown");

            link.addEventListener("click", (e) => {
                e.preventDefault();
                dropdown.classList.toggle("show");
            });
            document.addEventListener("click", (e) => {
                if (!li.contains(e.target)) dropdown.classList.remove("show");
            });

            // ---------- LOGOUT — clear session AND cart ----------
            li.querySelector("#logoutBtn").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Sign out?")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("cart");

                    // Reset badge
                    if (typeof updateCartCount === "function") updateCartCount();
                    const badge = document.getElementById("nav-cart-count");
                    if (badge) {
                        badge.textContent = "0";
                        badge.setAttribute("data-count", "0");
                    }

                    location.href = "index.html";
                }
            });

        } else {
            // ---------- LOGGED OUT ----------
            li.innerHTML = `
                <a href="${LOGIN_PAGE}" class="nav-link">
                    <span class="ion-ios-person"></span> Login
                </a>
            `;

            const cartBtn = navList.querySelector(".cart-btn");
            if (cartBtn && cartBtn.parentNode) {
                cartBtn.parentNode.insertBefore(li, cartBtn.nextSibling);
            } else {
                navList.appendChild(li);
            }
        }
    }

    /* ============================================================
       2. STYLES — Pills, badge, dropdown, mobile layout
       ============================================================ */
    function injectStyles() {
        if (document.getElementById("authNavStyles")) return;
        const style = document.createElement("style");
        style.id = "authNavStyles";
        style.textContent = `

            /* ============================================================
               CART + AUTH BUTTONS (desktop)
               ============================================================ */
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn,
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn {
                margin-left: 10px;
                position: relative;
            }

            /* Cart — round gold pill */
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn > a.cart-link {
                position: relative;
                background: #c8a97e !important;
                color: #fff !important;
                width: 46px;
                height: 46px;
                padding: 0 !important;
                border-radius: 50% !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 22px !important;
                box-shadow: 0 4px 12px rgba(200, 169, 126, 0.35);
                transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn > a.cart-link:hover {
                background: #b8956a !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 18px rgba(200, 169, 126, 0.5);
            }

            /* Cart badge (floating count) */
            .cart-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                left: auto;
                min-width: 20px;
                height: 20px;
                padding: 0 6px;
                border-radius: 10px;
                background: #e74c3c;
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                line-height: 20px;
                text-align: center;
                font-family: "Poppins", sans-serif;
                box-shadow: 0 2px 6px rgba(231, 76, 60, 0.5);
                border: 2px solid #1a1a1a;
                pointer-events: none;
                display: inline-block;
            }
            .cart-badge[data-count="0"] {
                display: none;
            }

            /* Auth — gold pill */
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn > a {
                background: #c8a97e !important;
                color: #fff !important;
                padding: 10px 22px !important;
                border-radius: 30px !important;
                font-size: 14px !important;
                font-weight: 500;
                line-height: 1.2;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(200, 169, 126, 0.35);
                transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn > a:hover {
                background: #b8956a !important;
                color: #fff !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 18px rgba(200, 169, 126, 0.5);
            }

            /* Dot separator between cart and auth */
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn::before {
                content: "";
                position: absolute;
                left: -5px;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
            }

            /* ============================================================
               LOGGED-IN DROPDOWN
               ============================================================ */
            .auth-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                min-width: 180px;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, .15);
                list-style: none;
                padding: 8px 0;
                margin: 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-6px);
                transition: all .25s ease;
                z-index: 1000;
            }
            .auth-dropdown.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .auth-dropdown li a {
                display: block;
                padding: 10px 20px;
                color: #333 !important;
                font-size: 14px;
                transition: background .2s ease;
            }
            .auth-dropdown li a:hover {
                background: #f8f6f3;
                color: #c8a97e !important;
            }

            /* ============================================================
               SCROLLED NAVBAR — keep pills round & badges in place
               ============================================================ */
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.auth-btn > a,
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cart-btn > a.cart-link {
                background: #c8a97e !important;
                color: #fff !important;
            }

            /* Cart pill — stays round when scrolled */
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cart-btn > a.cart-link {
                width: 46px !important;
                height: 46px !important;
                padding: 0 !important;
                border-radius: 50% !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 22px !important;
            }

            /* Badge — stays floating outside the circle when scrolled */
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cart-btn > a.cart-link .cart-badge {
                position: absolute !important;
                top: -4px !important;
                right: -4px !important;
                left: auto !important;
                min-width: 20px !important;
                height: 20px !important;
                padding: 0 6px !important;
                border-radius: 10px !important;
                background: #e74c3c !important;
                color: #fff !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                line-height: 20px !important;
                text-align: center !important;
                border: 2px solid #1a1a1a !important;
                display: inline-block !important;
                margin: 0 !important;
            }

            /* Auth pill — stays a pill when scrolled */
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.auth-btn > a {
                padding: 10px 22px !important;
                border-radius: 30px !important;
                font-size: 14px !important;
                display: inline-flex !important;
                align-items: center !important;
            }

            /* ============================================================
               MOBILE — move cart + auth OUTSIDE the collapsed menu
               ============================================================ */
            @media (max-width: 991.98px) {

                .ftco-navbar-light > .container {
                    display: flex !important;
                    align-items: center !important;
                    flex-wrap: wrap !important;
                    justify-content: space-between !important;
                }
                .ftco-navbar-light .navbar-brand {
                    order: 1;
                    flex: 0 0 auto;
                }
                .ftco-navbar-light .mobile-action-strip {
                    order: 2;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-left: auto;
                    margin-right: 10px;
                }
                .ftco-navbar-light .navbar-toggler {
                    order: 3;
                    flex: 0 0 auto;
                }
                .ftco-navbar-light .navbar-collapse {
                    order: 4;
                    flex-basis: 100%;
                    width: 100%;
                    margin-top: 12px;
                }
                .ftco-navbar-light .mobile-action-strip .nav-item {
                    margin: 0 !important;
                    list-style: none;
                    padding: 0 !important;
                }

                /* Cart circle — smaller on mobile */
                .ftco-navbar-light .mobile-action-strip .nav-item.cart-btn > a.cart-link {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    font-size: 18px !important;
                    background: #c8a97e !important;
                    color: #fff !important;
                    border-radius: 50% !important;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 !important;
                }

                /* Badge — snug fit on the corner of the cart circle */
                .ftco-navbar-light .mobile-action-strip .cart-badge {
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    left: auto;
                    min-width: 16px;
                    height: 16px;
                    padding: 0 4px;
                    border-radius: 8px;
                    background: #e74c3c;
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    line-height: 16px;
                    text-align: center;
                    border: 2px solid #1a1a1a;
                    box-shadow: 0 2px 4px rgba(231, 76, 60, 0.4);
                    display: inline-block;
                    margin: 0;
                }

                /* Auth pill — compact */
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn > a {
                    padding: 8px 14px !important;
                    font-size: 13px !important;
                    border-radius: 25px !important;
                }

                /* Hide dot separator */
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn::before {
                    display: none;
                }

                /* Dropdown full width */
                .auth-dropdown {
                    position: fixed;
                    top: 70px;
                    right: 15px;
                    left: 15px;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, .2);
                }

                /* Mobile + scrolled — keep pills round */
                .ftco-navbar-light.scrolled .mobile-action-strip .nav-item.cart-btn > a.cart-link {
                    width: 40px !important;
                    height: 40px !important;
                    padding: 0 !important;
                    border-radius: 50% !important;
                }
                .ftco-navbar-light.scrolled .mobile-action-strip .cart-badge {
                    top: -3px !important;
                    right: -3px !important;
                    left: auto !important;
                    position: absolute !important;
                }
                .ftco-navbar-light.scrolled .mobile-action-strip .nav-item.auth-btn > a {
                    padding: 8px 14px !important;
                    border-radius: 25px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       3. MOBILE LAYOUT — physically move buttons into the strip
       ============================================================ */
    function forceMobileLayout() {
        const navbarContainer = document.querySelector(".ftco-navbar-light > .container");
        if (!navbarContainer) return;

        let strip = document.getElementById("mobileActionStrip");
        if (!strip) {
            strip = document.createElement("div");
            strip.id = "mobileActionStrip";
            strip.className = "mobile-action-strip";
            navbarContainer.appendChild(strip);
        }

        const authLi = document.getElementById("authNavItem");
        const cartLi = document.querySelector(".ftco-navbar-light .cart-btn");
        const navList = document.querySelector(".ftco-navbar-light .navbar-nav");

        if (!authLi || !cartLi || !navList) return;

        const isMobile = window.innerWidth < 992;

        if (isMobile) {
            if (cartLi.parentNode !== strip) strip.appendChild(cartLi);
            if (authLi.parentNode !== strip) strip.appendChild(authLi);
        } else {
            if (cartLi.parentNode !== navList) navList.appendChild(cartLi);
            if (authLi.parentNode !== navList) {
                navList.insertBefore(authLi, cartLi.nextSibling);
            }
        }
    }

    /* ============================================================
   5. LOGIN GATE — block cart link for guests
   ============================================================ */
    function gateCartLink() {
        const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href="/cart"]');
        cartLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                if (!localStorage.getItem("token")) {
                    e.preventDefault();
                    if (window.LoginGate) {
                        window.LoginGate.requireLogin("/cart");
                    } else {
                        alert("Please login first.");
                        window.location.href = "/login";
                    }
                }
            });
        });
    }

    /* ============================================================
       4. RUN
       ============================================================ */
    function bootstrap() {
        injectStyles();
        init();
        forceMobileLayout();
        setTimeout(gateCartLink, 200); // wait for auth-nav DOM to render
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
        bootstrap();
    }

    window.addEventListener("resize", forceMobileLayout);

})();