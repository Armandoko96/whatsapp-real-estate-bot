"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveService = void 0;
const drive_1 = require("@googleapis/drive");
const fs_1 = __importDefault(require("fs"));
class DriveService {
    getRootFolderId() {
        return this.rootFolderId;
    }
    constructor() {
        const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || '';
        const credentials = JSON.parse(fs_1.default.readFileSync(credentialsPath, 'utf8'));
        const googleAuth = new drive_1.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive']
        });
        this.drive = (0, drive_1.drive)({ version: 'v3', auth: googleAuth });
        this.rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
    }
    // Sube un archivo genérico a una carpeta
    async uploadFile(fileName, buffer, folderId, mimeType) {
        const { Readable } = await Promise.resolve().then(() => __importStar(require('stream')));
        return await this.drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
                mimeType,
            },
            media: {
                mimeType,
                body: Readable.from(buffer),
            },
            fields: 'id',
        });
    }
    // Busca o crea una carpeta por nombre dentro de un folder padre
    async getOrCreateFolder(name, parentId) {
        const res = await this.drive.files.list({
            q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
            fields: 'files(id, name)',
        });
        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id;
        }
        const folder = await this.drive.files.create({
            requestBody: {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId],
            },
            fields: 'id',
        });
        return folder.data.id;
    }
    // Crea la jerarquía de carpetas según la ruta
    async createPropertyFolders(route) {
        let parentId = this.rootFolderId;
        for (const name of route) {
            parentId = await this.getOrCreateFolder(name, parentId);
        }
        return parentId;
    }
}
exports.DriveService = DriveService;
