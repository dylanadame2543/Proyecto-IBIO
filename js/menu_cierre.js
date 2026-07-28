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
// --- LÓGICA DEL MÓDULO 2: RESULTADOS (TABLA DINÁMICA) ---
const panelResultados = document.getElementById('panelResultados');
// Obtenemos el historial de la memoria y lo convertimos de vuelta a objeto
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
        historialGuardado.reverse().forEach(item => {
            tablaHTML += `
                <tr style="border-bottom: 1px solid #eee; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9ff'" onmouseout="this.style.backgroundColor='white'">
                    <td style="padding: 15px; border: 1px solid #eee; font-size: 0.9em; color: #718096;">${item.fecha}</td>
                    <td style="padding: 15px; border: 1px solid #eee; font-weight: bold; color: #13696a;">${item.perfil}</td>
                    <td style="padding: 15px; border: 1px solid #eee; font-size: 0.95em; color: #2d3748;">${item.dictamen}</td>
                </tr>
            `;
        });

        tablaHTML += `
                    </tbody>
                </table>
            </div>
            <button id="btnLimpiar" style="background-color: #e53e3e; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: opacity 0.3s;">
                Borrar Historial de Evaluaciones
            </button>
        `;

        panelResultados.innerHTML = tablaHTML;

        // Botón para vaciar la base de datos local y limpiar la tabla
        document.getElementById('btnLimpiar').addEventListener('click', () => {
            if(confirm("¿Estás seguro de que deseas borrar todo el historial de la Inteligencia Artificial?")) {
                localStorage.removeItem('historialCVs');
                window.location.reload(); 
            }
        });
    } else {
        // Mensaje cuando la tabla está vacía
        panelResultados.innerHTML = `
            <div style="background-color: #f8f9ff; padding: 30px; text-align: center; border: 2px dashed #cbd5e0; border-radius: 8px;">
                <span style="font-size: 2em; display: block; margin-bottom: 10px;">📊</span>
                <p style="color: #718096; font-size: 1.1em; font-weight: bold;">Base de datos vacía.</p>
                <p style="color: #a0aec0; font-size: 0.9em;">Aún no se ha evaluado ningún currículum. Ve al Módulo 1 para procesar un documento.</p>
            </div>
        `;
    }
}
