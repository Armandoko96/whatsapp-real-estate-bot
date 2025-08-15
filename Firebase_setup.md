# 🔥 FIREBASE CONFIGURATION COMPLETA

## 📋 CONFIGURACIÓN FIREBASE ADMIN SDK

### 1️⃣ CREDENCIALES SERVICE ACCOUNT
```json
{
  "type": "service_account",
  "***REMOVED***": "automatizadorvsc",
  "***REMOVED***_id": "10267edec90e4f8e9c8b5a3d2f1e0c9b8a7d6f5e",
  "***REMOVED***": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "***REMOVED***": "firebase-adminsdk-12345@automatizadorvsc.iam.gserviceaccount.com",
  "***REMOVED***": "123456789012345678901",
  "***REMOVED***": "https://accounts.google.com/o/oauth2/auth",
  "***REMOVED***": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "***REMOVED***": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-12345%40automatizadorvsc.iam.gserviceaccount.com"
}
```

### 2️⃣ INICIALIZACIÓN FIREBASE SERVICE
```typescript
import admin from 'firebase-admin';

export class FirebaseService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    try {
      // Inicializar con credenciales del archivo
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
          })
        });
      }
      
      this.db = admin.firestore();
      console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error);
      throw error;
    }
  }

  // Guardar propiedad
  async saveProperty(propertyData: any): Promise<string> {
    try {
      const docRef = await this.db.collection('properties').add({
        ...propertyData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Propiedad guardada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error guardando propiedad:', error);
      throw error;
    }
  }

  // Actualizar propiedad
  async updateProperty(propertyId: string, updates: any): Promise<void> {
    try {
      await this.db.collection('properties').doc(propertyId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Propiedad actualizada:', propertyId);
    } catch (error) {
      console.error('❌ Error actualizando propiedad:', error);
      throw error;
    }
  }

  // Obtener propiedad
  async getProperty(propertyId: string): Promise<any> {
    try {
      const doc = await this.db.collection('properties').doc(propertyId).get();
      
      if (!doc.exists) {
        console.log('❌ Propiedad no encontrada:', propertyId);
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('❌ Error obteniendo propiedad:', error);
      throw error;
    }
  }

  // Guardar sesión de usuario
  async saveUserSession(phoneNumber: string, sessionData: any): Promise<void> {
    try {
      await this.db.collection('userSessions').doc(phoneNumber).set({
        ...sessionData,
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Sesión guardada:', phoneNumber);
    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
      throw error;
    }
  }

  // Obtener sesión de usuario
  async getUserSession(phoneNumber: string): Promise<any> {
    try {
      const doc = await this.db.collection('userSessions').doc(phoneNumber).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data();
    } catch (error) {
      console.error('❌ Error obteniendo sesión:', error);
      throw error;
    }
  }
}
```

## 📊 ESTRUCTURA DE COLECCIONES FIRESTORE

### COLECCIÓN: `properties`
```json
{
  "EDR123": {
    "id": "EDR123",
    "phoneNumber": "+521234567890",
    "agent": "Casas de Elias",
    "type": "Directo",
    "operation": "Rentas", 
    "sector": "Centro",
    "propertyDetails": {
      "price": "15000",
      "size": "120m2",
      "bedrooms": 3,
      "bathrooms": 2,
      "description": "Casa amplia en el centro..."
    },
    "driveFolder": {
      "id": "1ABC123DEF456",
      "url": "https://drive.google.com/drive/folders/1ABC123DEF456",
      "path": "Casas de Elias/Directo/Rentas/Centro/EDR123"
    },
    "images": [
      {
        "fileName": "EDR123_2025-08-08T21-30-00.jpg",
        "driveFileId": "1XYZ789",
        "url": "https://drive.google.com/file/d/1XYZ789/view"
      }
    ],
    "geminiAnalysis": {
      "extractedInfo": {...},
      "confidence": 0.85,
      "suggestions": [...]
    },
    "documents": [
      {
        "type": "property_summary",
        "fileName": "EDR123_resumen.docx",
        "driveFileId": "1DOC456"
      }
    ],
    "status": "completed",
    "createdAt": "2025-08-08T21:30:00Z",
    "updatedAt": "2025-08-08T21:45:00Z"
  }
}
```

### COLECCIÓN: `userSessions`
```json
{
  "+521234567890": {
    "currentRoute": {
      "agent": "Casas de Elias",
      "type": "Directo",
      "operation": "Rentas",
      "sector": "Centro"
    },
    "propertyId": "EDR123",
    "waitingForImages": true,
    "folderId": "1ABC123DEF456",
    "imagesReceived": 2,
    "lastActivity": "2025-08-08T21:30:00Z",
    "conversationState": "awaiting_images"
  }
}
```

### COLECCIÓN: `agents`
```json
{
  "elias": {
    "name": "Casas de Elias",
    "email": "elias@inmobiliaria.com",
    "phone": "+521234567890",
    "driveFolder": "1ELIAS_FOLDER",
    "permissions": ["create", "read", "update"],
    "active": true
  },
  "diana": {
    "name": "Casas de Diana", 
    "email": "diana@inmobiliaria.com",
    "phone": "+521234567891",
    "driveFolder": "1DIANA_FOLDER",
    "permissions": ["create", "read", "update"],
    "active": true
  }
}
```

## 🔧 RULES DE FIRESTORE
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Propiedades - acceso completo
    match /properties/{propertyId} {
      allow read, write: if true;
    }
    
    // Sesiones de usuario - acceso completo
    match /userSessions/{phoneNumber} {
      allow read, write: if true;
    }
    
    // Agentes - solo lectura para el sistema
    match /agents/{agentId} {
      allow read: if true;
      allow write: if false; // Solo admin puede modificar
    }
  }
}
```

## ⚙️ VARIABLES DE ENTORNO RAILWAY
```env
***REMOVED*** Configuration
***REMOVED***
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-12345@automatizadorvsc.iam.gserviceaccount.com  
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----

# Archivo de credenciales (alternativa)
GOOGLE_APPLICATION_CREDENTIALS=./automatizadorvsc-10267edec90e.json
```

## 🔄 INTEGRACIÓN CON SERVER.TS
```typescript
import { FirebaseService } from './services/firebaseService';

const firebaseService = new FirebaseService();

// Al configurar ruta
async function handleRoute(text: string, fromNumber: string, userSession: any) {
  const structure = parseRoute(text);
  const propertyId = generateId(structure);
  
  // Guardar en Firebase
  await firebaseService.saveProperty({
    id: propertyId,
    phoneNumber: fromNumber,
    agent: structure.agent,
    type: structure.type,
    operation: structure.operation,
    sector: structure.sector,
    status: 'awaiting_images'
  });
  
  // Guardar sesión
  await firebaseService.saveUserSession(fromNumber, {
    currentRoute: structure,
    propertyId: propertyId,
    waitingForImages: true,
    conversationState: 'awaiting_images'
  });
}

// Al recibir imágenes
async function handleImageMessage(message: any, fromNumber: string, userSession: any) {
  // ... código de imagen ...
  
  // Actualizar propiedad en Firebase
  await firebaseService.updateProperty(userSession.propertyId, {
    images: admin.firestore.FieldValue.arrayUnion({
      fileName: fileName,
      driveFileId: fileId,
      uploadedAt: new Date().toISOString()
    })
  });
}
```

## 🚨 TROUBLESHOOTING FIREBASE

### Error: "Firebase not initialized"
```bash
# Verificar variables de entorno
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
echo $FIREBASE_PRIVATE_KEY
```

### Error: "Permission denied"
```bash
# Verificar reglas de Firestore
# Verificar Service Account permissions
```

### Error: "Quota exceeded" 
```bash
# Verificar límites en Firebase Console
# Implementar rate limiting
```
