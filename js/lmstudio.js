// Nota de Corrección: Es pdfjsLib con 'L' mayúscula
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Función para extraer texto de un archivo PDF localmente desde el navegador
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textpage = await page.getTextContent();
        textContent += textpage.items.map(item => item.str).join(' ') + '\n';
    }
    
    return textContent.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
}

// Función para comunicarse con la IA LOCAL corriendo en LM Studio (misma laptop)
// Requiere que este LM Studio abierto, y el modelo IA de "Llama-3.2-3B-Instruct (Q4_K_M)"
// servidor local activo (de la pestaña Developer) y CORS habilitado.
async function consultarLocalIA(textdocument) {
    const urlLocal = 'http://127.0.0.1:1234/v1/chat/completions'; // ejemplo para poner el url local 'http://localhost:1234/v1/chat/completions'

    const payload = {
        model: "llama-3.2-3b-instruct", //Debe coincidir exactamente con el nombre que muestra LM Studio en la pestaña Developer
        messages: [
            {
                role: "system",
                content: "Eres un experto en recursos humanos. Analiza el CV y responde ESTRICTAMENTE con este formato exacto, sin texto adicional antes o después:\nESTATUS: [VERDE o AMARILLO o ROJO]\nPUNTAJE: [número del 0 al 100 que represente qué tan buen candidato es]\nFACTIBILIDAD: [Texto indicando si es factible contratar y por qué en una línea]\nRESUMEN: [Breve descripción del nivel de estudios]"
            },
            {
                role: "user",
                content: `[CURRÍCULUM]: ${textdocument}`
            }
        ],
        temperature: 0.0,
    };  //Nota interna: mejorar el prompt para que la IA devuelva un resultado más preciso y útil para la evaluación de candidatos. [Listo]

    let response;
    try {
        response = await fetch(urlLocal, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        throw new Error('No se pudo conectar con el localhost:1234, Verifica que tu servidor local esté encendido y que CORS esté activado.');
    }

    if (!response.ok) {
        const errorDetalle = await response.text();
        throw new Error(`Código ${response.status} - ${errorDetalle}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Escuchador del archivo PDF en la interfaz
const PDFInput = document.getElementById('pdfInput');
const resultadoBox = document.getElementById('resultadoIA');
const textoResultado = document.getElementById('textoResultado');

if (PDFInput) {
    PDFInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Mostrar al usuario que estamos procesando el PDF
        resultadoBox.style.display = 'block';
        textoResultado.textContent = "Analizando currículum...";
        textoResultado.style.color = "#4a5568";

        try {
            const extractedText = await extractTextFromPDF(file);
            
            if (!extractedText || extractedText.length === 0) {
                textoResultado.textContent = "Error: El PDF no contiene texto extraíble (El PDF es una imagen escaneada).";
                textoResultado.style.color = "red";
                return;
            }

            textoResultado.textContent = "Analizando currículum, Por Favor espere...";
            
            // Enviar al modelo local de LM Studio y esperar respuesta
            const localResponse = await consultarLocalIA(extractedText);

            // Extraer el puntaje numérico (0-100) para poder rankear candidatos después
            const matchPuntaje = localResponse.match(/PUNTAJE:\s*(\d+)/i);
            const puntaje = matchPuntaje ? parseInt(matchPuntaje[1], 10) : 0;
            
            // Informamos que se realizo con éxito el analisis
            textoResultado.textContent = "¡Análisis completado! redirigiendo...";
            textoResultado.style.color = "green";
            textoResultado.style.fontWeight = "bold";

            // se guarda los datos en el historial del navegador, mostrando los resultados en la tabla de resultados extraidos y analizados de la IA
            let historialResultados = JSON.parse(localStorage.getItem('historialCVs')) || [];
            
            historialResultados.push({
                fecha: new Date().toLocaleString(),
                perfil: "Candidato " + (historialResultados.length + 1),
                dictamen: localResponse,
                puntaje: puntaje
            });

            localStorage.setItem('historialCVs', JSON.stringify(historialResultados));

            // Una vez mostrado el resultado, redirigimos al menú, directo a la tabla de resultados extraidos y analizados de la IA
            setTimeout(() => {
                window.location.href = "Menu_principal.html#resultados";
            }, 2000);

       } catch (error) {
            console.error('Error procesando:', error);
            // Esto imprimirá el error técnico exacto en la interfaz
            textoResultado.textContent = "Error técnico: " + error.message;
            textoResultado.style.color = "red";
        }
    });
}
