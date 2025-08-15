

import { drive_v3, drive } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

export class DriveService {
  private drive: drive_v3.Drive;
  private rootFolderId: string;

  public getRootFolderId() {
    return this.rootFolderId;
  }

  constructor() {
    // OAuth2 de usuario real
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: process.env.GOOGLE_ACCESS_TOKEN
    });
    this.drive = drive({ version: 'v3', auth: oAuth2Client });
    this.rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  }

  // Sube un archivo genérico a una carpeta
  async uploadFile(fileName: string, buffer: Buffer, folderId: string, mimeType: string) {
    const { Readable } = await import('stream');
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
  async getOrCreateFolder(name: string, parentId: string): Promise<string> {
    const res = await this.drive.files.list({
      q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });
    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }
    const folder = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
    });
    return folder.data.id!;
  }

  // Crea la jerarquía de carpetas según la ruta
  async createPropertyFolders(route: string[]): Promise<string> {
    let parentId = this.rootFolderId;
    for (const name of route) {
      parentId = await this.getOrCreateFolder(name, parentId);
    }
    return parentId;
  }
}
