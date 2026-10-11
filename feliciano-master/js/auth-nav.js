/* ============================================================
   AUTH NAV — Login button + Cart icon + mobile layout
   Order: [ Book a table ] [ Cart ] [ Login ]
   ============================================================ */

(function () {
    "use strict";

    const LOGIN_PAGE = "login.html";

    /* ============================================================
       1. INIT
       ============================================================ */
    function init() {
        const navList = document.querySelector(".ftco-navbar-light .navbar-nav");
        if (!navList) return;
        if (document.getElementById("authNavItem")) return;

        // 🔒 If not logged in, clear any stale cart
        const hasToken = !!localStorage.getItem("token");
        const hasUser = !!localStorage.getItem("user");
        if (!hasToken || !hasUser) {
            localStorage.removeItem("cart");
        }

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const li = document.createElement("li");
        li.className = "nav-item cta auth-btn";
        li.id = "authNavItem";

        if (user) {
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

            li.querySelector("#logoutBtn").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Sign out?")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("cart");
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
       2. STYLES
       ============================================================ */
    function injectStyles() {
        if (document.getElementById("authNavStyles")) return;
        const style = document.createElement("style");
        style.id = "authNavStyles";
        style.textContent = `

            /* ============================================================
               NAVBAR breathing room
               ============================================================ */
            .ftco-navbar-light {
                padding-top: 15px !important;
                padding-bottom: 15px !important;
            }
            .ftco-navbar-light .navbar-nav {
                align-items: center !important;
            }
            .ftco-navbar-light .navbar-nav > .nav-item {
                display: flex !important;
                align-items: center !important;
            }
            .ftco-navbar-light .navbar-nav > .nav-item > a {
                margin-top: 6px !important;
                margin-bottom: 6px !important;
            }

            /* ============================================================
               DESKTOP — unified pill buttons
               ============================================================ */
            .ftco-navbar-light .navbar-nav > .nav-item.cta {
                margin-left: 10px;
                margin-top: 6px;
                margin-bottom: 6px;
            }

            .ftco-navbar-light .navbar-nav > .nav-item.cta > a {
                height: 44px !important;
                min-height: 44px !important;
                padding: 0 22px !important;
                background: #c8a97e !important;
                color: #fff !important;
                border-radius: 22px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                box-shadow: 0 4px 12px rgba(200, 169, 126, 0.3) !important;
                transition: transform .25s ease, background .25s ease, box-shadow .25s ease !important;
                line-height: 1 !important;
                text-transform: none !important;
                letter-spacing: 0 !important;
                position: relative !important;
                border: none !important;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.cta > a:hover {
                background: #b8956a !important;
                color: #fff !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 18px rgba(200, 169, 126, 0.45) !important;
            }

            /* CART (desktop) */
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn {
                position: relative;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn > a.cart-link {
                padding: 0 22px !important;
                gap: 10px !important;
                font-size: 15px !important;
                position: relative !important;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.cart-btn > a.cart-link .ion-ios-cart {
                font-size: 19px !important;
                line-height: 1 !important;
            }

            /* Cart badge (desktop) */
            .cart-badge {
                position: absolute !important;
                top: -7px !important;
                right: -7px !important;
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
                font-family: "Poppins", sans-serif !important;
                box-shadow: 0 2px 6px rgba(231, 76, 60, 0.5) !important;
                border: 2px solid #fff !important;
                pointer-events: none !important;
                display: inline-block !important;
                z-index: 5 !important;
            }
            .cart-badge[data-count="0"] {
                display: none !important;
            }

            /* AUTH pill */
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn {
                position: relative;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn > a {
                padding: 0 22px !important;
            }
            .ftco-navbar-light .navbar-nav > .nav-item.auth-btn > a .ion-ios-person {
                font-size: 16px !important;
            }

            /* Dropdown */
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
                text-transform: none;
                letter-spacing: 0;
                border-radius: 0;
                background: transparent;
                height: auto;
            }
            .auth-dropdown li a:hover {
                background: #f8f6f3 !important;
                color: #c8a97e !important;
                transform: none;
                box-shadow: none;
            }

            /* SCROLLED desktop */
            .ftco-navbar-light.scrolled {
                padding-top: 10px !important;
                padding-bottom: 10px !important;
            }
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cta > a {
                background: #c8a97e !important;
                color: #fff !important;
                height: 44px !important;
                padding: 0 22px !important;
                border-radius: 22px !important;
            }
            .ftco-navbar-light.scrolled .navbar-nav > .nav-item.cart-btn > a.cart-link {
                padding: 0 22px !important;
                height: 44px !important;
                border-radius: 22px !important;
                width: auto !important;
            }

            /* ============================================================
               MOBILE
               ============================================================ */
            @media (max-width: 991.98px) {

                /* Navbar row layout */
                .ftco-navbar-light > .container {
                    display: flex !important;
                    align-items: center !important;
                    flex-wrap: wrap !important;
                    justify-content: space-between !important;
                    min-height: 60px !important;
                }
                .ftco-navbar-light .navbar-brand {
                    order: 1;
                    flex: 0 0 auto;
                    margin-right: auto;
                }
                .ftco-navbar-light .mobile-action-strip {
                    order: 2;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 0 0 auto;
                }
                .ftco-navbar-light .navbar-toggler {
                    order: 3;
                    flex: 0 0 auto;
                    margin-left: 8px;
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

                /* CART — round gold circle with cart icon */
                .ftco-navbar-light .mobile-action-strip .nav-item.cart-btn > a.cart-link {
                    position: relative !important;
                    width: 42px !important;
                    height: 42px !important;
                    min-width: 42px !important;
                    padding: 0 !important;
                    background: #c8a97e !important;
                    color: #fff !important;
                    border-radius: 50% !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 17px !important;
                    box-shadow: 0 3px 10px rgba(200, 169, 126, 0.35) !important;
                }
                .ftco-navbar-light .mobile-action-strip .nav-item.cart-btn > a.cart-link .ion-ios-cart {
                    font-size: 17px !important;
                }

                /* Cart badge — snug on the circle */
                .ftco-navbar-light .mobile-action-strip .cart-badge {
                    position: absolute !important;
                    top: -3px !important;
                    right: -3px !important;
                    left: auto !important;
                    min-width: 16px !important;
                    height: 16px !important;
                    padding: 0 4px !important;
                    border-radius: 8px !important;
                    background: #e74c3c !important;
                    color: #fff !important;
                    font-size: 9px !important;
                    font-weight: 700 !important;
                    line-height: 16px !important;
                    text-align: center !important;
                    border: 2px solid #1a1a1a !important;
                    box-shadow: 0 2px 4px rgba(231, 76, 60, 0.4) !important;
                    display: inline-block !important;
                    z-index: 5 !important;
                }

                /* LOGIN pill — same height as cart circle */
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn > a {
                    height: 42px !important;
                    min-height: 42px !important;
                    padding: 0 16px !important;
                    font-size: 13px !important;
                    border-radius: 21px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                }
                .ftco-navbar-light .mobile-action-strip .nav-item.auth-btn > a .ion-ios-person {
                    font-size: 14px !important;
                }

                /* BOOK A TABLE — full width, tucked into hamburger */
                .ftco-navbar-light .navbar-nav > .nav-item.cta:not(.cart-btn):not(.auth-btn) {
                    margin-top: 10px;
                    margin-left: 0;
                    width: 100%;
                }
                .ftco-navbar-light .navbar-nav > .nav-item.cta:not(.cart-btn):not(.auth-btn) > a {
                    width: 100% !important;
                    justify-content: center !important;
                    height: 46px !important;
                    border-radius: 23px !important;
                }

                /* Dropdown — full width */
                .auth-dropdown {
                    position: fixed;
                    top: 70px;
                    right: 15px;
                    left: 15px;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, .2);
                }

                /* SCROLLED mobile — keep identical size */
                .ftco-navbar-light.scrolled .mobile-action-strip .nav-item.cart-btn > a.cart-link {
                    width: 42px !important;
                    height: 42px !important;
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
                    height: 42px !important;
                    padding: 0 16px !important;
                    border-radius: 21px !important;
                    font-size: 13px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       3. MOBILE LAYOUT — move cart + login into the strip
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