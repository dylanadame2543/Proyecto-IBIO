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
const btnModulo1 = document.getElementById('btnModulo1');

// Protección de la ruta
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.textContent = user.email;
    } else {
        window.location.href = "../Inicio.html";
    }
});
// Referencia al botón del Módulo 2
const btnModulo2 = document.getElementById('btnModulo2');

if (btnModulo2) {
    btnModulo2.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Buscamos si el panel de resultados está en la misma página
        const panelResultados = document.getElementById('panelResultados') || document.getElementById('resultados');
        
        if (panelResultados) {
            // Si estamos en la misma página, hacemos scroll suave hacia la tabla
            panelResultados.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Si estamos en otra página, redirigimos al ancla de resultados del menú principal
            window.location.href = "Menu_principal.html#resultados";
        }
    });
}
// Cerrar sesión
btnLogout.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});

// Evento para redirigir a la página de encuestas
if (btnModulo1) {
    btnModulo1.addEventListener('click', () => {
        window.location.href = "Encuesta.html";
    });
}

// --- LÓGICA DEL MÓDULO 2: RESULTADOS (TABLA DINÁMICA CON SEMÁFORO) ---
const panelResultados = document.getElementById('panelResultados');
const historialGuardado = JSON.parse(localStorage.getItem('historialCVs')) || [];

if (panelResultados) {
    if (historialGuardado.length > 0) {
        // Construimos el esqueleto de la tabla
        let tablaHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background-color: #002045; color: white;">
                            <th style="padding: 15px; text-align: left; border: 1px solid #ddd;">Fecha de Evaluación</th>
                            <th style="padding: 15px; text-align: left; border: 1px solid #ddd;">Candidato</th>
                            <th style="padding: 15px; text-align: left; border: 1px solid #ddd;">Dictamen IA (Nivel de Estudios)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Iteramos sobre el arreglo de forma inversa para ver el CV más reciente arriba
        historialGuardado.slice().reverse().forEach(item => {
            let colorFondo = "#edf2f7";
            let textoSemáforo = "PENDIENTE";
            let colorBadge = "#718096";

            const dictamenUpper = (item.dictamen || "").toUpperCase();
            if (dictamenUpper.includes("VERDE")) {
                colorFondo = "#f0fff4";
                textoSemáforo = "🟢 FACTIBLE PARA CONTRATAR";
                colorBadge = "#38a169"; // Verde
            } else if (dictamenUpper.includes("ROJO")) {
                colorFondo = "#fff5f5";
                textoSemáforo = "🔴 NO FACTIBLE";
                colorBadge = "#e53e3e"; // Rojo
            } else {
                colorFondo = "#fffaf0";
                textoSemáforo = "🟡 EN REVISIÓN / CONDICIONADO";
                colorBadge = "#d69e2e"; // Amarillo/Anaranjado
            }

            tablaHTML += `
                <tr style="border-bottom: 1px solid #eee; background-color: ${colorFondo};">
                    <td style="padding: 15px; border: 1px solid #eee; font-size: 0.9em; color: #718096;">${item.fecha}</td>
                    <td style="padding: 15px; border: 1px solid #eee; font-weight: bold; color: #13696a;">${item.perfil}</td>
                    <td style="padding: 15px; border: 1px solid #eee;">
                        <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; color: white; background-color: ${colorBadge}; font-size: 0.85em; font-weight: bold; margin-bottom: 8px;">
                            ${textoSemáforo}
                        </span>
                        <div style="font-size: 0.95em; color: #2d3748; white-space: pre-line;">${item.dictamen}</div>
                    </td>
                </tr>
            `;
        });

        tablaHTML += `
                    </tbody>
                </table>
            </div>
        `;

        panelResultados.innerHTML = tablaHTML;
    } else {
        panelResultados.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">Aún no se ha evaluado ningún currículum en esta sesión.</p>';
    }
}