# 🔧 CONFIGURACIÓN COMPLETA - Google Drive Service

## 📋 CONFIGURACIÓN REQUERIDA

### 1️⃣ CREDENCIALES DE GOOGLE (automatizadorvsc-10267edec90e.json)
```json
{
  "type": "service_account",
  "***REMOVED***": "automatizadorvsc",
  "***REMOVED***_id": "10267edec90e...",
  "***REMOVED***": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "***REMOVED***": "...",
  "***REMOVED***": "...",
  "***REMOVED***": "https://accounts.google.com/o/oauth2/auth",
  "***REMOVED***": "https://accounts.google.com/o/oauth2/token"
}
```

### 2️⃣ VARIABLES DE ENTORNO REQUERIDAS
```env
***REMOVED***
***REMOVED***
GOOGLE_DRIVE_FOLDER_ID=1ABC123... # ID de carpeta raíz en Drive

***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***


## 🏗️ ESTRUCTURA DE CARPETAS EN GOOGLE DRIVE

### JERARQUÍA AUTOMÁTICA:
```
📁 AUTOMATIZADOR INMOBILIARIO/
├── 📁 Casas de Elias/
│   ├── 📁 Directo/
│   │   ├── 📁 Rentas/
│   │   │   └── 📁 [Sector]/
│   │   │       └── 📁 EDR123_2025-08-08/
│   │   │           ├── 🖼️ EDR123_imagen1.jpg
│   │   │           ├── 🖼️ EDR123_imagen2.jpg
│   │   │           └── 📄 EDR123_detalles.docx
│   │   └── 📁 Ventas/
│   └── 📁 Indirecto/
└── 📁 Casas de Diana/
    └── [Misma estructura]
```

## 🔧 IMPLEMENTACIÓN GOOGLEDRIVESERVICE

### MÉTODOS PRINCIPALES:
- `createBusinessFolders(structure, propertyId)` - Crea jerarquía completa
- `uploadFile(fileName, buffer, folderId, mimeType)` - Sube archivos
- `getFolderId(path)` - Encuentra/crea carpetas por ruta
- `shareFolder(folderId, email)` - Comparte carpetas

### PERMISOS REQUERIDOS:
- **Google Drive API** habilitado
- **Scope:** `https://www.googleapis.com/auth/drive`
- **Service Account** con acceso a carpeta raíz

## 🤖 INTEGRACIÓN CON GEMINI AI

### ANÁLISIS DE PROPIEDADES:
```javascript
const propertyAnalysis = await geminiService.analyzeProperty(text, images);
// Extrae: precio, m², ubicación, características, descripción
```

### GENERACIÓN DE DOCUMENTOS:
```javascript
const document = await documentService.generatePropertyDocument({
  propertyId,
  analysis: geminiAnalysis,
  images: imageUrls,
  route: routeStructure
});
```

## 🔄 FLUJO COMPLETO ORIGINAL

### 1. DETECCIÓN DE RUTA
```
Usuario: "Elias Directo Renta Centro"
→ Parsea: {agent: "Casas de Elias", type: "Directo", operation: "Rentas", sector: "Centro"}
→ Genera: ID = EDR123
→ Crea: Estructura de carpetas en Drive
```

### 2. RECEPCIÓN DE IMÁGENES  
```
Usuario: [Envía imágenes]
→ Descarga: Media desde WhatsApp API
→ Sube: A carpeta específica en Drive
→ Nombra: EDR123_timestamp.jpg
```

### 3. ANÁLISIS CON GEMINI
```
→ Analiza: Texto del usuario + Imágenes
→ Extrae: Características de la propiedad
→ Genera: Descripción estructurada
```

### 4. DOCUMENTO FINAL
```
→ Crea: Documento Word con toda la info
→ Incluye: Imágenes, análisis, detalles
→ Guarda: En la misma carpeta Drive
→ Comparte: Con agente correspondiente
```

## ⚙️ CONFIGURACIÓN FIREBASE

### REGLAS DE SEGURIDAD:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      allow read, write: if true;
    }
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```

### ESTRUCTURA DE DATOS:
```json
{
  "properties": {
    "EDR123": {
      "id": "EDR123",
      "agent": "Casas de Elias",
      "type": "Directo", 
      "operation": "Rentas",
      "sector": "Centro",
      "createdAt": "2025-08-08T...",
      "phoneNumber": "+521234567890",
      "driveFolder": "1ABC123...",
      "images": ["file1.jpg", "file2.jpg"],
      "analysis": {...},
      "status": "completed"
    }
  }
}
```

## 🚨 TROUBLESHOOTING COMÚN

### ERROR: "Google Drive no configurado"
- Verificar: `automatizadorvsc-10267edec90e.json` existe
- Verificar: Variables de entorno correctas
- Verificar: Service Account tiene permisos


### ERROR: "Gemini API quota exceeded"
- Verificar: API Key válida
- Verificar: Límites de uso
- Implementar: Rate limiting


