// src/app/lib/pdfExtractor.js
import { promises as fsPromises } from 'fs';
import path from 'path';
import os from 'os';

// === CAMBIO CLAVE AQUÍ: Importación directa de la función principal de pdf-to-text ===
// La mayoría de las librerías CommonJS que exponen una sola función la exportan así.
const pdfToText = require('pdf-to-text');

// Promesa manual para la función de conversión
const convertPdfToTextAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        // pdfToText(filePath, options, callback)
        // Asumiendo que toma la ruta del archivo, un objeto de opciones (opcional), y un callback.
        // Pasamos un objeto vacío de opciones por seguridad.
        pdfToText.pdfToText(filePath, {}, (err, data) => { // A veces la función se llama 'pdfToText' dentro del módulo
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
// ===================================================================

export async function extractTextFromPdf(buffer) {
    let tempFilePath = '';
    try {
        const tempFileName = `temp_book_${Date.now()}.pdf`;
        tempFilePath = path.join(os.tmpdir(), tempFileName); // Usa el directorio temporal del SO

        await fsPromises.writeFile(tempFilePath, buffer);

        const text = await convertPdfToTextAsync(tempFilePath); 

        // Limitar a los primeros 1500 caracteres
        return text.substring(0, 1500); 

    } catch (error) {
        console.error("Error al extraer texto del PDF con pdf-to-text:", error);
        throw new Error(`Error al procesar el PDF con pdf-to-text: ${error.message || 'Error desconocido'}`);
    } finally {
        // Asegúrate de eliminar el archivo temporal
        if (tempFilePath) {
            try {
                await fsPromises.unlink(tempFilePath);
            } catch (unlinkError) {
                console.error(`Error al eliminar archivo temporal ${tempFilePath}:`, unlinkError);
            }
        }
    }
}