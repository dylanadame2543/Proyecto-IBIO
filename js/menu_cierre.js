import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAzD1VeVUcvUkE2o8fchTly9oKR9yahCpk",
    authDomain: "ibio-32ba1.firebaseapp.com",
    projectId: "ibio-32ba1",
    storageBucket: "ibio-32ba1.firebasestorage.app",
    messagingSenderId: "412556332836",
    appId: "1:412556332836:web:16b5c0fab0ffd28bd76db1",
    measurementId: "G-7FNL79JHKL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias exclusivas de la página del menú
const userEmailSpan = document.getElementById('userEmail');
const btnLogout = document.getElementById('btnLogout');

// Protección de la ruta
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.textContent = user.email;
    } else {
        window.location.href = "index.html";
    }
});

// Cerrar sesión
btnLogout.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});