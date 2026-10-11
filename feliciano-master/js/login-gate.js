/* ============================================================
   LOGIN GATE — Require login before cart / checkout / reservation
   ============================================================ */

(function () {
    "use strict";

    function isLoggedIn() {
        return !!localStorage.getItem("token") && !!localStorage.getItem("user");
    }

    /* ---------- Inject Modal ---------- */
    function injectModal() {
        if (document.getElementById("loginGateModal")) return;

        const style = document.createElement("style");
        style.id = "loginGateStyles";
        style.textContent = `
            .lg-overlay {
                position: fixed;
                inset: 0;
                background: rgba(17, 17, 17, 0.75);
                backdrop-filter: blur(6px);
                z-index: 9998;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: lgFade .2s ease both;
            }
            .lg-overlay.active { display: flex; }
            @keyframes lgFade { from { opacity: 0; } to { opacity: 1; } }

            .lg-modal {
                background: #fff;
                border-radius: 16px;
                padding: 44px 40px;
                max-width: 440px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
                animation: lgPop .35s ease both;
                position: relative;
            }
            @keyframes lgPop {
                from { opacity: 0; transform: scale(0.92); }
                to   { opacity: 1; transform: scale(1); }
            }

            .lg-icon {
                width: 80px; height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #c8a97e, #b18f64);
                color: #fff;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 20px;
                font-size: 36px;
                box-shadow: 0 10px 30px rgba(200, 169, 126, 0.45);
            }

            .lg-modal h3 {
                font-family: "Great Vibes", cursive;
                font-size: 40px; color: #c8a97e;
                font-weight: normal; line-height: 1;
                margin: 0 0 8px;
            }
            .lg-modal p {
                color: #666; font-size: 15px; line-height: 1.5;
                margin: 0 0 28px;
                font-family: "Poppins", sans-serif;
            }
            .lg-actions {
                display: flex; gap: 12px;
                flex-wrap: wrap; justify-content: center;
            }
            .lg-btn {
                flex: 1 1 160px;
                padding: 14px 24px;
                border-radius: 30px;
                font-family: "Poppins", sans-serif;
                font-size: 14px; font-weight: 600;
                cursor: pointer; text-decoration: none;
                transition: all .3s ease;
                display: inline-flex;
                align-items: center; justify-content: center;
                gap: 8px;
                border: 2px solid transparent;
            }
            .lg-btn-primary {
                background: #c8a97e; color: #fff;
                box-shadow: 0 6px 18px rgba(200, 169, 126, 0.4);
            }
            .lg-btn-primary:hover {
                background: #b8956a; color: #fff;
                transform: translateY(-2px);
                box-shadow: 0 10px 24px rgba(200, 169, 126, 0.55);
            }
            .lg-btn-outline {
                background: #fff; color: #c8a97e;
                border-color: #c8a97e;
            }
            .lg-btn-outline:hover {
                background: #c8a97e; color: #fff;
                transform: translateY(-2px);
            }
            .lg-cancel {
                display: block; margin-top: 18px;
                color: #999; font-size: 13px;
                text-decoration: none;
                font-family: "Poppins", sans-serif;
            }
            .lg-cancel:hover { color: #c8a97e; }
            .lg-close {
                position: absolute; top: 14px; right: 18px;
                background: transparent; border: none;
                font-size: 22px; color: #bbb;
                cursor: pointer; line-height: 1; padding: 6px;
                transition: color .2s;
            }
            .lg-close:hover { color: #c8a97e; }

            @media (max-width: 500px) {
                .lg-modal { padding: 34px 24px; }
                .lg-modal h3 { font-size: 32px; }
                .lg-icon { width: 64px; height: 64px; font-size: 28px; }
                .lg-btn { flex: 1 1 100%; }
            }
        `;
        document.head.appendChild(style);

        const modal = document.createElement("div");
        modal.id = "loginGateModal";
        modal.className = "lg-overlay";
        modal.innerHTML = `
            <div class="lg-modal">
                <button class="lg-close" aria-label="Close" id="lgCloseBtn">×</button>
                <div class="lg-icon"><span class="ion-ios-person"></span></div>
                <h3>Please Login</h3>
                <p>You need to be signed in to continue shopping.<br>Sign in or create an account to proceed.</p>

                <div class="lg-actions">
                    <a href="/login" class="lg-btn lg-btn-primary" id="lgLoginBtn">
                        <span class="ion-ios-person"></span> Sign In
                    </a>
                    <a href="/signup" class="lg-btn lg-btn-outline" id="lgSignupBtn">
                        <span class="ion-ios-person-add"></span> Sign Up
                    </a>
                </div>

                <a href="#" class="lg-cancel" id="lgCancelBtn">
                    &larr; Continue as guest
                </a>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("lgCloseBtn").addEventListener("click", close);
        document.getElementById("lgCancelBtn").addEventListener("click", (e) => {
            e.preventDefault(); close();
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) close();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) close();
        });
    }

    /* ---------- Open / Close ---------- */
    function open(returnUrl) {
        injectModal();
        const modal = document.getElementById("loginGateModal");

        const backTo = returnUrl || window.location.pathname + window.location.search;
        try {
            sessionStorage.setItem("lg_return_to", backTo);
        } catch (e) {}

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function close() {
        const modal = document.getElementById("loginGateModal");
        if (modal) modal.classList.remove("active");
        document.body.style.overflow = "";
    }

    /* ---------- Public API ---------- */
    window.LoginGate = {
        requireLogin: function (returnUrl) {
            if (isLoggedIn()) return true;
            open(returnUrl);
            return false;
        },
        isLoggedIn: isLoggedIn,
        open: open,
        close: close
    };

    /* ---------- Guard cart links automatically ---------- */
    function attachCartGuards() {
        const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href="/cart"]');
        cartLinks.forEach(link => {
            if (link.dataset.lgGuarded) return;
            link.dataset.lgGuarded = "1";
            link.addEventListener("click", (e) => {
                if (!isLoggedIn()) {
                    e.preventDefault();
                    open("/cart");
                }
            });
        });
    }

    /* ---------- Run ---------- */
    function boot() {
        injectModal();
        attachCartGuards();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    setTimeout(attachCartGuards, 500);
    setTimeout(attachCartGuards, 1500);

})();