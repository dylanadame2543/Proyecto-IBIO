pdfjslib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Función para extraer texto de un archivo PDF
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjslib.getDocument(arrayBuffer).promise;
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textpage = await page.getTextContent();
        textContent += textpage.items.map(item => item.str).join(' ') + '\n';
    }
    
    return textContent.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
}

// Función para comunicarse con el servidor local de LM Studio
async function consultarLMstudio(textdocument) {
    // Puerto estándar de LM Studio por defecto
    const urlLMstudio = 'http://localhost:1234/v1/chat/completions'; 
    
    const payload = {
        model: "local-model", // LM studio ignora este campo si solo hay un modelo cargado
        messages: [
            {
                role: "system",
                content: "Eres un asistente experto en recursos humanos académicos."
            },
            {
                role: "user",
                content: `Analiza el siguiente currículum en formato de texto y responde brevemente: ¿Qué nivel de estudios más alto tiene la persona que envió el currículum? [CURRÍCULUM]: ${textdocument}`
            }
        ],
        temperature: 0.1, 
    };

    const response = await fetch(urlLMstudio, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error del servidor IA: ${response.statusText}`);
    }

    const data = await response.json();
    // Corrección del error tipográfico: es "choices", no "choises"
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
        textoResultado.textContent = "Extrayendo texto del PDF e inicializando IA... Por favor espera.";
        textoResultado.style.color = "#4a5568";

        try {
            const extractedText = await extractTextFromPDF(file);
            
            // Corrección de la validación matemática de longitud
            if (!extractedText || extractedText.length === 0) {
                textoResultado.textContent = "Error: El PDF no contiene texto extraíble (puede ser una imagen escaneada).";
                textoResultado.style.color = "red";
                return;
            }

            textoResultado.textContent = "Consultando con LM Studio. Procesando inferencia...";
            
            // Enviar a la IA y esperar respuesta
            const lmstudioResponse = await consultarLMstudio(extractedText);
            
            // 1. Informamos al usuario que la IA terminó
            textoResultado.textContent = "¡Análisis completado! Redirigiendo al panel de resultados...";
            textoResultado.style.color = "green";
            textoResultado.style.fontWeight = "bold";

            // 2. Guardamos la respuesta de la IA en la memoria del navegador
            localStorage.setItem('resultadoCV', lmstudioResponse);

            // 3. Esperamos 2 segundos y redirigimos al menú, bajando directo a la sección #resultados
            setTimeout(() => {
                window.location.href = "Menu_principal.html#resultados";
            }, 2000);

        } catch (error) {
            // AQUÍ ESTÁ EL CIERRE CORRECTO DEL CÓDIGO
            console.error('Error procesando:', error);
            textoResultado.textContent = "Error al conectar con la IA. Asegúrate de que LM Studio esté encendido y el servidor local iniciado en el puerto 1234.";
            textoResultado.style.color = "red";
        }
    });
}