// Corrección: Es pdfjsLib con 'L' mayúscula
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Función para extraer texto de un archivo PDF localmente en el navegador
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

// Función para comunicarse con la Inteligencia Artificial en la Nube (Groq API)
// Función para comunicarse con la Inteligencia Artificial en la Nube (Groq API)
async function consultarCloudIA(textdocument) {
    const urlCloud = 'https://api.groq.com/openai/v1/chat/completions'; 
    const apiKey = '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'; 
    
    const payload = {
        model: "llama-3.3-70b-versatile", 
        messages: [
            {
                role: "system",
                content: "Eres un experto en recursos humanos. Analiza el CV y responde estrictamente con este formato exacto: \nESTATUS: [VERDE o AMARILLO o ROJO]\nFACTIBILIDAD: [Texto indicando si es factible contratar y por qué en una línea]\nRESUMEN: [Breve descripción del nivel de estudios]"
            },
            {
                role: "user",
                content: `[CURRÍCULUM]: ${textdocument}`
            }
        ],
        temperature: 0.1, 
    };

    const response = await fetch(urlCloud, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

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

        // Mostrar al usuario que estamos procesando
        resultadoBox.style.display = 'block';
        textoResultado.textContent = "Extrayendo texto del PDF... Conectando con la nube de Groq.";
        textoResultado.style.color = "#4a5568";

        try {
            const extractedText = await extractTextFromPDF(file);
            
            if (!extractedText || extractedText.length === 0) {
                textoResultado.textContent = "Error: El PDF no contiene texto extraíble (puede ser una imagen escaneada).";
                textoResultado.style.color = "red";
                return;
            }

            textoResultado.textContent = "Analizando currículum mediante Inteligencia Artificial...";
            
            // Enviar a la IA en la nube y esperar respuesta
            const cloudResponse = await consultarCloudIA(extractedText);
            
            // 1. Informamos éxito
            textoResultado.textContent = "¡Análisis completado! Guardando en el historial y redirigiendo...";
            textoResultado.style.color = "green";
            textoResultado.style.fontWeight = "bold";

            // 2. Guardamos en el historial del navegador
            let historialResultados = JSON.parse(localStorage.getItem('historialCVs')) || [];
            
            historialResultados.push({
                fecha: new Date().toLocaleString(),
                perfil: "Candidato " + (historialResultados.length + 1),
                dictamen: cloudResponse
            });

            localStorage.setItem('historialCVs', JSON.stringify(historialResultados));

            // 3. Redirigimos al menú, directo a la tabla de resultados
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