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
const btnModulo1 = document.getElementById('btnModulo1'); // Nueva referencia

// Protección de la ruta
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.textContent = user.email;
    } else {
        // Redirige correctamente al archivo Inicio.html que está en la carpeta principal
        window.location.href = "../Inicio.html";
    }
});

// Cerrar sesión
btnLogout.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});

// Evento para redirigir a la página de encuestas
if (btnModulo1) {
    btnModulo1.addEventListener('click', () => {
        // Redirige a Encuesta.html (ambos están en la misma carpeta 'pages')
        window.location.href = "Encuesta.html";
    });
}
// --- LÓGICA DEL MÓDULO 2: RESULTADOS ---
const panelResultados = document.getElementById('panelResultados');
const resultadoGuardado = localStorage.getItem('resultadoCV');

// Si existe el panel en esta página y hay un resultado guardado en memoria
if (panelResultados && resultadoGuardado) {
    panelResultados.innerHTML = `
        <h3 style="color: #13696a; margin-bottom: 15px;">✓ Pre-evaluación IA Completada</h3>
        
        <p style="background-color: #eaf1ff; padding: 15px; border-left: 5px solid #0056b3; font-weight: bold; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
            ${resultadoGuardado}
        </p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; font-size: 0.95em; border: 1px solid #ffeeba;">
            <strong>⚠️ Estado del Trámite (En Revisión):</strong><br>
            Su perfil ha sido procesado por nuestro modelo de Inteligencia Artificial. Por favor, espere mientras el Comité Académico valida esta pre-evaluación. Recibirá el dictamen final en su correo institucional.
        </div>
        
        <button id="btnLimpiar" style="margin-top: 20px; background-color: #e53e3e; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Procesar nuevo candidato
        </button>
    `;

    // Botón para limpiar la memoria y hacer una nueva encuesta
    document.getElementById('btnLimpiar').addEventListener('click', () => {
        localStorage.removeItem('resultadoCV');
        window.location.reload(); // Recarga la página para mostrar el panel vacío
    });
}