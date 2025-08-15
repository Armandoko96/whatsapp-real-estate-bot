import { DriveService } from './driveService';

export async function uploadImageToDrive(drive: DriveService, folderId: string, fileName: string, buffer: Buffer, mimeType: string) {
  return await drive.uploadFile(fileName, buffer, folderId, mimeType);
}

export async function uploadDocToDrive(drive: DriveService, folderId: string, fileName: string, buffer: Buffer) {
  return await drive.uploadFile(fileName, buffer, folderId, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
