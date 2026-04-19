// Firebase SDK のインポート (※ご自身のFirebaseプロジェクトの設定に置き換えてください)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyC2BVmeNeRZvut2JReOmkjF299MmlKuI74",
  authDomain: "smart-timekeeper.firebaseapp.com",
  projectId: "smart-timekeeper",
  storageBucket: "smart-timekeeper.firebasestorage.app",
  messagingSenderId: "820557203439",
  appId: "1:820557203439:web:d1f4d25c72e6b08602d81a"
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- 共通UI 初期化 ---
export const initCommonUI = (pageTitle = "Smart TimeKeeper") => {
    // ヘッダー生成
    const header = document.createElement('header');
    header.className = 'bg-white shadow-sm sticky top-0 z-50';
    header.innerHTML = `
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="index.html" class="text-xl font-bold text-blue-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                ${pageTitle}
            </a>
            <button id="hamburger-btn" class="hamburger-btn focus:outline-none p-2">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
            </button>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // ハンバーガーメニュー生成
    const navAndOverlay = document.createElement('div');
    navAndOverlay.innerHTML = `
        <div id="sideMenu" class="sidenav">
            <a href="guide.html">使い方ガイド</a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdlvIr5ehyy3dInl_XTkA5F64H7yFIigL2dzFW0IoXnl8ajdw/viewform?usp=dialog" target="_blank" rel="noopener noreferrer">お問い合わせ</a>
            <a href="release-notes.html">リリースノート</a>
            
            <div class="menu-separator">
                <a href="https://qcda-dev.github.io/HP/" target="_blank" rel="noopener noreferrer">QcDa Projectとは</a>
                <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank" rel="noopener noreferrer" class="sub-link">利用規約</a>
                <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank" rel="noopener noreferrer" class="sub-link">コミュニティガイドライン</a>
            </div>

            <!-- ログアウトボタン領域（未ログイン時は隠す） -->
            <div id="logout-menu-item" class="menu-separator hidden">
                <a href="#" id="logout-link" class="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold">
                    ログアウト
                </a>
            </div>

            <div class="version-info">ver 1.0.0</div>
        </div>
        <div id="menuOverlay"></div>
    `;
    document.body.appendChild(navAndOverlay);

    // フッター生成
    const footer = document.createElement('footer');
    footer.className = 'bg-slate-800 text-slate-300 py-6 text-center text-sm mt-auto w-full';
    footer.innerHTML = `
        <div class="space-x-4 mb-2">
            <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank" class="hover:text-white transition">利用規約</a>
            <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank" class="hover:text-white transition">ガイドライン</a>
        </div>
        <p>&copy; 2026 QcDa Project. All Rights Reserved.</p>
    `;
    document.body.appendChild(footer);

    // メニュー開閉ロジック
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    const toggleMenu = () => {
        hamburgerBtn.classList.toggle("open");
        const isOpen = sideMenu.style.width === "280px";
        sideMenu.style.width = isOpen ? "0" : "280px";
        menuOverlay.style.display = isOpen ? "none" : "block";
    };

    hamburgerBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    // ログアウト処理の紐付け
    setTimeout(() => {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    }, 0);
};

// --- Authentication ロジック ---
export const authGuard = (requireLogin = true, redirectUrl = 'login.html') => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            
            // ログイン状態に応じてログアウトボタンの表示を切り替え
            const logoutMenuItem = document.getElementById('logout-menu-item');
            if (user && logoutMenuItem) {
                logoutMenuItem.classList.remove('hidden');
            } else if (!user && logoutMenuItem) {
                logoutMenuItem.classList.add('hidden');
            }

            if (requireLogin && !user) {
                window.location.replace(redirectUrl);
            } else if (!requireLogin && user) {
                // login.html や index.html にいるが、既にログイン済みの場合
                window.location.replace('dashboard.html');
            } else {
                resolve(user);
            }
        });
    });
};

export const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Login failed:", error);
        alert("ログインに失敗しました。");
    }
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // ログアウト後はトップへ
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
