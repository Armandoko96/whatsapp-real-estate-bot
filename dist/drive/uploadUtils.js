"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToDrive = uploadImageToDrive;
exports.uploadDocToDrive = uploadDocToDrive;
async function uploadImageToDrive(drive, folderId, fileName, buffer, mimeType) {
    return await drive.uploadFile(fileName, buffer, folderId, mimeType);
}
async function uploadDocToDrive(drive, folderId, fileName, buffer) {
    return await drive.uploadFile(fileName, buffer, folderId, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
