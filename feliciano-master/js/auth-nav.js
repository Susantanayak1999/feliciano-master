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
                    localStorage.removeItem("cart");   // ← clear cart

                    // Reset cart badge immediately
                    if (typeof updateCartCount === "function") {
                        updateCartCount();
                    }
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

            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn,
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn {
                margin-left: 10px;
                position: relative;
            }

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

            .cart-badge {
                position: absolute;
                top: -4px;
                right: -4px;
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
            }
            .cart-badge[data-count="0"] {
                display: none;
            }

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

            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.auth-btn > a,
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cart-btn > a.cart-link {
                background: #c8a97e !important;
                color: #fff !important;
            }

            @media (max-width: 991.98px) {

                .ftco-navbar-light > .container {
                    display: flex !important;
                    align-items: center !important;
                    flex-wrap: wrap !important;
                    justify-content: space-between !important;
                }
                .ftco-navbar-light .navbar-brand { order: 1; flex: 0 0 auto; }
                .ftco-navbar-light .mobile-action-strip {
                    order: 2;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-left: auto;
                    margin-right: 10px;
                }
                .ftco-navbar-light .navbar-toggler { order: 3; flex: 0 0 auto; }
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
                }
                .ftco-navbar-light .mobile-action-strip .cart-badge {
                    position: absolute;
                    top: -3px;
                    right: -3px;
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
                }
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn > a {
                    padding: 8px 14px !important;
                    font-size: 13px !important;
                    border-radius: 25px !important;
                }
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn::before {
                    display: none;
                }
                .auth-dropdown {
                    position: fixed;
                    top: 70px;
                    right: 15px;
                    left: 15px;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, .2);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       3. MOBILE LAYOUT
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
       4. RUN
       ============================================================ */
    function bootstrap() {
        injectStyles();
        init();
        forceMobileLayout();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
        bootstrap();
    }

    window.addEventListener("resize", forceMobileLayout);

})();