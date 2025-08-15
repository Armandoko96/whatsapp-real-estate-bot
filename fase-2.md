# Fase 2 – Plan de funcionalidades

## Objetivo
Permitir a los usuarios consultar información de casas almacenadas en Google Drive a través del bot de WhatsApp, con búsquedas flexibles y control de roles.

---

### 1. Consulta de casas por ID o búsqueda aproximada
- Solicitar casa por ID exacto (ej: “EDVNS001”).
- Si el ID no es exacto, sugerir opciones similares (“¿Te refieres a...?”).
- Permitir búsqueda por descripción parcial (ej: “casa amarilla elias”), mostrando coincidencias en nombres/carpetas/descripciones.

### 2. Envío de información de la casa
- Enviar imágenes y descripción en texto (no .doc) para fácil reenvío a clientes.

### 3. Roles de usuario
- Administrador: acceso a comandos especiales (gestión de usuarios, cambio de nombres, etc.).
- Visualizadores: solo pueden consultar casas, no subir nuevas.
- Acceso de administrador mediante contraseña (ejemplo: Tentramitrozon1*).

### 4. Gestión de nombres y descripciones
- IDs de casas con formato: “ID - descripción” (ej: “EDVNS001 - casa amarilla santa fe”).
- Permitir modificar el nombre de la carpeta en Drive si la descripción cambia.

---

**Notas:**
- El flujo actual permite implementar esto de forma sencilla.
- Se aprovecharán las capacidades de búsqueda y manejo de archivos ya integradas.
- Los roles se gestionarán con una lista de usuarios y validación de contraseña.

---

*Este archivo documenta los objetivos y pasos aproximados para la Fase 2 del proyecto.*
