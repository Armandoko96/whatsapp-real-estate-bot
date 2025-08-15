"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappBot = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const geminiService_1 = require("../gemini/geminiService");
const driveService_1 = require("../drive/driveService");
const idGenerator_1 = require("../id/idGenerator");
const uploadUtils_1 = require("../drive/uploadUtils");
const docx_1 = require("docx");
const gemini = new geminiService_1.GeminiService();
const drive = new driveService_1.DriveService();
// Estado simple en memoria para asociar flujo por usuario
const userSessions = {};
class WhatsappBot {
    constructor() {
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
            puppeteer: { headless: true }
        });
    }
    start() {
        this.client.on('qr', (qr) => {
            qrcode_terminal_1.default.generate(qr, { small: true });
            console.log('Escanea el QR con WhatsApp Web');
        });
        this.client.on('ready', () => {
            console.log('Bot de WhatsApp listo.');
        });
        this.client.on('message', async (msg) => {
            const userId = msg.from;
            if (!userSessions[userId]) {
                userSessions[userId] = { step: 'awaitingRoute', images: [] };
            }
            const session = userSessions[userId];
            // Paso 1: Esperar ruta
            if (session.step === 'awaitingRoute') {
                if (!msg.hasMedia) {
                    session.routeText = msg.body.trim();
                    // Permitir separadores por espacio o por /
                    let folderRoute = session.routeText.includes('/')
                        ? session.routeText.split('/').map(s => s.trim())
                        : session.routeText.split(' ').map(s => s.trim()).filter(Boolean);
                    // Si hay más de 5 palabras, unir las últimas como colonia
                    if (folderRoute.length > 5) {
                        const base = folderRoute.slice(0, 4);
                        const last = folderRoute.slice(4).join(' ');
                        folderRoute = [...base, last];
                    }
                    if (folderRoute.length < 4) {
                        await msg.reply('La ruta debe tener al menos 4 palabras: contacto subcontacto operación colonia. Si no incluyes el sector, la IA lo intentará inferir.');
                        return;
                    }
                    let agent = folderRoute[0];
                    let type = folderRoute[1];
                    let operation = folderRoute[2];
                    let sector = '';
                    let colony = '';
                    if (folderRoute.length === 5) {
                        sector = folderRoute[3];
                        colony = folderRoute[4];
                    }
                    else {
                        colony = folderRoute[3];
                        // Usar Gemini para inferir sector
                        try {
                            const loc = await gemini.identifyLocation(colony);
                            sector = loc.sector;
                            colony = loc.colony;
                        }
                        catch (e) {
                            await msg.reply('No se pudo inferir el sector automáticamente. Especifica el sector en la ruta.');
                            return;
                        }
                    }
                    // Buscar consecutivo (simplificado: timestamp, pero puedes mejorar)
                    const consecutive = Date.now() % 1000;
                    const propertyId = (0, idGenerator_1.generateId)({ agent, type, operation, sector, colony }, consecutive);
                    // Crear jerarquía de carpetas
                    let parentId = drive.getRootFolderId();
                    const fullRoute = [agent, type, operation, sector, colony];
                    for (const name of fullRoute) {
                        parentId = await drive.getOrCreateFolder(name, parentId);
                    }
                    // Crear subcarpeta final con el ID
                    const idFolderName = propertyId;
                    parentId = await drive.getOrCreateFolder(idFolderName, parentId);
                    session.folderId = parentId;
                    session.propertyId = propertyId;
                    session.step = 'awaitingInput';
                    await msg.reply(`Carpeta creada: ${fullRoute.join('/')} / ${propertyId}\nAhora envía imágenes o la descripción.`);
                }
                else {
                    await msg.reply('Primero envía la ruta aproximada de la propiedad en formato: CONTACTO/SUBCONTACTO/OPERACIÓN/SECTOR/COLONIA\nPor ejemplo: elias/directo/venta/salida norte/santa fe');
                }
            }
            // Paso 2: Confirmar si crear nueva carpeta
            // Eliminamos el paso de confirmación, ya que la carpeta con ID siempre se crea
            // Paso 3: Recibir imágenes
            else if (session.step === 'awaitingInput') {
                if (msg.hasMedia) {
                    const media = await msg.downloadMedia();
                    if (!media) {
                        await msg.reply('No se pudo descargar la imagen.');
                        return;
                    }
                    const buffer = Buffer.from(media.data, 'base64');
                    session.images.push({
                        buffer,
                        mimeType: media.mimetype,
                        fileName: media.filename || `imagen_${session.images.length + 1}.jpg`
                    });
                    await msg.reply('Imagen recibida. Puedes enviar más imágenes o la descripción.');
                }
                else if (msg.body && msg.body.trim().length > 0) {
                    session.description = msg.body.trim();
                    // Procesar descripción y guardar todo
                    try {
                        console.log('--- PROCESO DE DESCRIPCIÓN INICIADO ---');
                        console.log('Descripción recibida:', session.description);
                        console.log('Imágenes recibidas:', session.images.length);
                        // Mejorar descripción
                        const improved = await gemini.improveDescription(session.description);
                        console.log('Descripción mejorada:', improved);
                        // Subir imágenes
                        for (const img of session.images) {
                            console.log('Subiendo imagen a Drive:', img.fileName);
                            await (0, uploadUtils_1.uploadImageToDrive)(drive, session.folderId, img.fileName, img.buffer, img.mimeType);
                        }
                        // Crear y subir documento
                        const doc = new docx_1.Document({
                            sections: [{ children: [new docx_1.Paragraph(improved)] }]
                        });
                        const docBuffer = await docx_1.Packer.toBuffer(doc);
                        console.log('Subiendo documento detalles.docx a Drive...');
                        await (0, uploadUtils_1.uploadDocToDrive)(drive, session.folderId, `detalles.docx`, docBuffer);
                        await msg.reply('Propiedad guardada correctamente en Drive.');
                        delete userSessions[userId];
                    }
                    catch (e) {
                        console.error('Error en procesamiento de descripción o subida a Drive:', e);
                        await msg.reply('Error procesando la descripción o guardando archivos: ' + e);
                    }
                }
                else {
                    await msg.reply('Envía imágenes o la descripción.');
                }
            }
            // Paso 4: Procesar descripción y guardar todo
            else if (session.step === 'awaitingDesc') {
                try {
                    console.log('--- PROCESO DE DESCRIPCIÓN INICIADO ---');
                    console.log('Descripción recibida:', session.description);
                    console.log('Imágenes recibidas:', session.images.length);
                    if (!session.images || session.images.length === 0) {
                        await msg.reply('Advertencia: No se recibieron imágenes antes de la descripción. Si deseas agregar imágenes, envíalas antes de la descripción.');
                    }
                    // Mejorar descripción
                    const improved = await gemini.improveDescription(session.description);
                    console.log('Descripción mejorada:', improved);
                    // Subir imágenes
                    for (const img of session.images) {
                        console.log('Subiendo imagen a Drive:', img.fileName);
                        await (0, uploadUtils_1.uploadImageToDrive)(drive, session.folderId, img.fileName, img.buffer, img.mimeType);
                    }
                    // Crear y subir documento
                    const doc = new docx_1.Document({
                        sections: [{ children: [new docx_1.Paragraph(improved)] }]
                    });
                    const docBuffer = await docx_1.Packer.toBuffer(doc);
                    console.log('Subiendo documento detalles.docx a Drive...');
                    await (0, uploadUtils_1.uploadDocToDrive)(drive, session.folderId, `detalles.docx`, docBuffer);
                    delete userSessions[userId];
                    console.log('--- PROCESO DE DESCRIPCIÓN FINALIZADO ---');
                    await msg.reply('Propiedad guardada correctamente en Drive.');
                }
                catch (e) {
                    console.error('Error en procesamiento de descripción o subida a Drive:', e);
                    await msg.reply('Error procesando la descripción o guardando archivos: ' + e);
                }
            }
        });
        this.client.initialize();
    }
}
exports.WhatsappBot = WhatsappBot;
