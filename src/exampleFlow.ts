import { GeminiService } from './gemini/geminiService';
import { DriveService } from './drive/driveService';
import { generateId, PropertyRoute } from './id/idGenerator';

async function main() {
  const gemini = new GeminiService();
  const drive = new DriveService();

  // Ejemplo de texto recibido
  const textoUbicacion = 'Fraccionamiento Santa Fe, salida norte';
  const descripcion = 'Casa moderna de 3 recámaras, 2 baños, cochera para dos autos.';

  // 1. Identificar sector y colonia
  const location = await gemini.identifyLocation(textoUbicacion);
  console.log('Sector:', location.sector, 'Colonia:', location.colony);

  // 2. Generar ID
  const route: PropertyRoute = {
    agent: 'Elias',
    type: 'Directo',
    operation: 'Venta',
    sector: location.sector,
    colony: location.colony
  };
  const id = generateId(route, 1); // El consecutivo real debe obtenerse de la base de datos
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
