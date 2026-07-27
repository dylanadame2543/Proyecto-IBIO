import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const statusMessage = document.getElementById('statusMessage');

// Función de validación de seguridad de la contraseña
const validarContrasena = (password) => {
    if (password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (!/\d/.test(password)) {
        return "La contraseña debe incluir al menos un número.";
    }
    if (!/[A-Z]/.test(password)) {
        return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    return "OK";
};

// Evento: Registrar Usuario
document.getElementById('btnRegister').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Ejecutamos la validación antes de contactar a Firebase
    const validacion = validarContrasena(password);
    if (validacion !== "OK") {
        statusMessage.textContent = validacion;
        statusMessage.style.color = "red";
        return; // Detiene la ejecución si la contraseña es débil
    }

    statusMessage.textContent = "Procesando...";
    statusMessage.style.color = "black";

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            statusMessage.textContent = `¡Registro exitoso!`;
            statusMessage.style.color = "green";
        })
        .catch((error) => {
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.style.color = "red";
        });
});

// Evento: Iniciar Sesión
document.getElementById('btnLogin').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    statusMessage.textContent = "Procesando...";
    statusMessage.style.color = "black";

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            statusMessage.textContent = `¡Bienvenido! Sesión iniciada.`;
            statusMessage.style.color = "green";
        })
        .catch((error) => {
            statusMessage.textContent = `Error al iniciar: ${error.message}`;
            statusMessage.style.color = "red";
        });
});