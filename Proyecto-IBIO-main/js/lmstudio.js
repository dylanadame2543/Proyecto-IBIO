pdfjslib.globalworkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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

    const cleanedText = textContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();

    return cleanedText;
}

// Función para manejar la carga del archivo PDF    

async function consultarLMstudio(textdocument) {
    const urlLMstudio = 'https://api.lmstudio.ai/v1/query'; // Reemplaza con la URL correcta de LM Studio
    const apiKey = 'YOUR_LMSTUDIO_API_KEY'; // Reemplaza con tu clave de API de LM Studio

    const payload = {
        model: "modelo-de-ejemplo", // Reemplaza con el nombre del modelo que deseas usar
        messages: [
            {
                role: "user",
                content: `analiza el siguiente curriculum en formato de texto y responde: ¿que nivel de estudios tiene la persona que envio el curriculum?

[curriculum]
${textdocument}`
            }
        ],
        temperature: 0, // Ajusta la temperatura según tus necesidades
    };

    const response = await fetch(urlLMstudio, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error en la solicitud a LM Studio: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choises[0].message.content; // Ajusta según la estructura de la respuesta de LM Studio
}

// Funcion para manejar la selección del archivo PDF y la extracción de texto

const PDFInput = document.getElementById('pdfInput');

if (PDFInput) {
    PDFInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('Archivo PDF seleccionado:', file.name);

        try {
            const extractedText = await extractTextFromPDF(file);
            console.log('Texto extraído del PDF:', extractedText);

            // verificar si se extrajo texto del PDF y no contega imagenes.
            if (!extractedText || extractedText.trim() === 0) {
                console.warn('No se extrajo texto del PDF, ya que no contiene texto extraible.');
                alert('El PDF no contiene texto extraíble. Por favor, asegúrate de que el PDF tenga texto seleccionable.');
                return;
            }

            console.log('Texto extraído del PDF:', extractedText);
            const lmstudioResponse = await consultarLMstudio(extractedText);
            
            
            console.log('Respuesta de LM Studio:', lmstudioResponse);



        } catch (error) {
            console.error('Error:el archivo no se puede procesar o enviar', error);
            alert('Error al procesar el archivo PDF o al enviar la solicitud a LM Studio. Por favor, verifica la consola para más detalles.');
        }
    });

} else {
    console.error('No se encontró el elemento de entrada de archivo PDF con el ID "pdfInput" en el HTML actual.');
}
