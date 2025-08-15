"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geminiService_1 = require("./gemini/geminiService");
const driveService_1 = require("./drive/driveService");
const idGenerator_1 = require("./id/idGenerator");
async function main() {
    const gemini = new geminiService_1.GeminiService();
    const drive = new driveService_1.DriveService();
    // Ejemplo de texto recibido
    const textoUbicacion = 'Fraccionamiento Santa Fe, salida norte';
    const descripcion = 'Casa moderna de 3 recámaras, 2 baños, cochera para dos autos.';
    // 1. Identificar sector y colonia
    const location = await gemini.identifyLocation(textoUbicacion);
    console.log('Sector:', location.sector, 'Colonia:', location.colony);
    // 2. Generar ID
    const route = {
        agent: 'Elias',
        type: 'Directo',
        operation: 'Venta',
        sector: location.sector,
        colony: location.colony
    };
    const id = (0, idGenerator_1.generateId)(route, 1); // El consecutivo real debe obtenerse de la base de datos
    console.log('ID generado:', id);
    // 3. Crear estructura de carpetas en Drive
    const folderRoute = ['INMUEBLES', 'Elias', 'Directos', 'Ventas', `${location.sector}-${location.colony}`, `${id}_Casa_Moderna`];
    const folderId = await drive.createPropertyFolders(folderRoute);
    console.log('Carpeta creada en Drive con ID:', folderId);
    // 4. Mejorar descripción
    const improved = await gemini.improveDescription(descripcion);
    console.log('Descripción mejorada:', improved);
}
main().catch(console.error);
