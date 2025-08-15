# 🤖 GEMINI AI INTEGRATION COMPLETA

## 🔑 API KEY Y CONFIGURACIÓN

### VARIABLES DE ENTORNO:
```env
GEMINI_API_KEY=AIzaSyC-abc123def456ghi789jkl012mno345pqr678
```

### INICIALIZACIÓN GEMINI SERVICE:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY no configurada');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash" 
      });
      
      console.log('✅ Gemini AI inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Gemini:', error);
      throw error;
    }
  }

  // Analizar propiedad desde texto
  async analyzePropertyText(text: string, routeInfo: any): Promise<any> {
    try {
      const prompt = `
Analiza la siguiente información de propiedad inmobiliaria y extrae los datos estructurados.

CONTEXTO:
- Agente: ${routeInfo.agent}
- Tipo: ${routeInfo.type} 
- Operación: ${routeInfo.operation}
- Sector: ${routeInfo.sector}

TEXTO A ANALIZAR:
"${text}"

INSTRUCCIONES:
Extrae y estructura la siguiente información en formato JSON:

{
  "precio": "precio encontrado o 'No especificado'",
  "superficie": "metros cuadrados o 'No especificado'",
  "habitaciones": "número de habitaciones o 0",
  "baños": "número de baños o 0", 
  "estacionamientos": "número de estacionamientos o 0",
  "ubicacion": {
    "calle": "calle específica o ''",
    "colonia": "colonia/fraccionamiento o ''",
    "ciudad": "ciudad o 'Culiacán'",
    "referencias": "referencias adicionales o ''"
  },
  "caracteristicas": ["lista", "de", "características", "especiales"],
  "descripcion": "descripción limpia y profesional",
  "contacto": {
    "telefono": "número si se menciona o ''",
    "email": "email si se menciona o ''"
  },
  "confianza": 0.85
}

Responde SOLO con el JSON, sin texto adicional.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Limpiar y parsear JSON
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      
      console.log('✅ Análisis de texto completado');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analizando texto:', error);
      return this.getDefaultAnalysis();
    }
  }

  // Analizar imágenes de propiedades
  async analyzePropertyImages(imageBuffers: Buffer[], routeInfo: any): Promise<any> {
    try {
      const prompt = `
Analiza estas imágenes de una propiedad inmobiliaria y extrae información visual.

CONTEXTO:
- Agente: ${routeInfo.agent}
- Tipo: ${routeInfo.type}
- Operación: ${routeInfo.operation} 
- Sector: ${routeInfo.sector}

INSTRUCCIONES:
Analiza las imágenes y extrae en formato JSON:

{
  "espacios_identificados": ["cocina", "sala", "habitación", "etc"],
  "estado_propiedad": "excelente|bueno|regular|requiere_reparaciones",
  "estilo_arquitectonico": "moderno|tradicional|colonial|etc",
  "elementos_destacados": ["lista", "de", "elementos", "visibles"],
  "condiciones_visibles": ["nueva", "usada", "remodelada", "etc"],
  "estimacion_visual": {
    "habitaciones_aparentes": 2,
    "baños_visibles": 1,
    "tiene_cochera": true,
    "tiene_jardin": false
  },
  "calidad_imagenes": "alta|media|baja",
  "recomendaciones_foto": ["mejor", "iluminación", "etc"],
  "confianza_analisis": 0.75
}

Responde SOLO con el JSON.
`;

      // Convertir buffers a base64 para Gemini
      const imageParts = imageBuffers.map(buffer => ({
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: "image/jpeg"
        }
      }));

      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const analysisText = response.text();
      
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      
      console.log('✅ Análisis de imágenes completado');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analizando imágenes:', error);
      return this.getDefaultImageAnalysis();
    }
  }

  // Generar descripción profesional
  async generatePropertyDescription(textAnalysis: any, imageAnalysis: any, routeInfo: any): Promise<string> {
    try {
      const prompt = `
Genera una descripción profesional para una propiedad inmobiliaria.

INFORMACIÓN EXTRAÍDA:
Análisis de texto: ${JSON.stringify(textAnalysis, null, 2)}
Análisis de imágenes: ${JSON.stringify(imageAnalysis, null, 2)}
Ruta: ${routeInfo.agent} - ${routeInfo.type} - ${routeInfo.operation} - ${routeInfo.sector}

INSTRUCCIONES:
Genera una descripción profesional que incluya:
1. Encabezado atractivo
2. Características principales
3. Ubicación y sector
4. Detalles técnicos
5. Call to action

Estilo: Profesional pero atractivo, máximo 300 palabras.
Tono: Persuasivo pero honesto.

Responde solo con la descripción, sin formato adicional.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();
      
      console.log('✅ Descripción generada');
      return description;
      
    } catch (error) {
      console.error('❌ Error generando descripción:', error);
      return this.getDefaultDescription(routeInfo);
    }
  }

  // Análisis completo (texto + imágenes)
  async analyzeCompleteProperty(text: string, imageBuffers: Buffer[], routeInfo: any): Promise<any> {
    try {
      console.log('🤖 Iniciando análisis completo con Gemini...');
      
      // Análisis paralelo
      const [textAnalysis, imageAnalysis] = await Promise.all([
        this.analyzePropertyText(text, routeInfo),
        imageBuffers.length > 0 ? this.analyzePropertyImages(imageBuffers, routeInfo) : null
      ]);

      // Generar descripción profesional
      const description = await this.generatePropertyDescription(textAnalysis, imageAnalysis, routeInfo);

      const completeAnalysis = {
        textAnalysis,
        imageAnalysis,
        generatedDescription: description,
        processedAt: new Date().toISOString(),
        confidence: this.calculateOverallConfidence(textAnalysis, imageAnalysis)
      };

      console.log('✅ Análisis completo finalizado');
      return completeAnalysis;
      
    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  private getDefaultAnalysis(): any {
    return {
      precio: "No especificado",
      superficie: "No especificado", 
      habitaciones: 0,
      baños: 0,
      estacionamientos: 0,
      ubicacion: {
        calle: "",
        colonia: "",
        ciudad: "Culiacán",
        referencias: ""
      },
      caracteristicas: [],
      descripcion: "Información pendiente de análisis",
      contacto: {
        telefono: "",
        email: ""
      },
      confianza: 0.1
    };
  }

  private getDefaultImageAnalysis(): any {
    return {
      espacios_identificados: [],
      estado_propiedad: "no_determinado",
      estilo_arquitectonico: "no_determinado",
      elementos_destacados: [],
      condiciones_visibles: [],
      estimacion_visual: {
        habitaciones_aparentes: 0,
        baños_visibles: 0,
        tiene_cochera: false,
        tiene_jardin: false
      },
      calidad_imagenes: "no_evaluada",
      recomendaciones_foto: [],
      confianza_analisis: 0.1
    };
  }

  private getDefaultDescription(routeInfo: any): string {
    return `Propiedad disponible en ${routeInfo.sector} a través de ${routeInfo.agent}. 
${routeInfo.operation === 'Rentas' ? 'En renta' : 'En venta'} por ${routeInfo.type.toLowerCase()}. 
Contáctanos para más información y programar una visita.`;
  }

  private calculateOverallConfidence(textAnalysis: any, imageAnalysis: any): number {
    const textConf = textAnalysis?.confianza || 0;
    const imageConf = imageAnalysis?.confianza_analisis || 0;
    
    if (imageAnalysis) {
      return (textConf + imageConf) / 2;
    }
    return textConf;
  }
}
```

## 🔗 INTEGRACIÓN CON SERVER.TS

### INICIALIZACIÓN:
```typescript
import { GeminiService } from './services/geminiService';

const geminiService = new GeminiService();
```

### USO EN FLUJO DE IMÁGENES:
```typescript
// Cuando el usuario termina de enviar imágenes
async function finalizePropertyAnalysis(fromNumber: string, userSession: any) {
  try {
    console.log('🤖 Iniciando análisis con Gemini...');
    
    // Obtener imágenes descargadas
    const imageBuffers = await getStoredImages(userSession.propertyId);
    
    // Analizar con Gemini
    const analysis = await geminiService.analyzeCompleteProperty(
      userSession.originalText || "",
      imageBuffers,
      userSession.currentRoute
    );
    
    // Guardar análisis en Firebase
    await firebaseService.updateProperty(userSession.propertyId, {
      geminiAnalysis: analysis,
      status: 'analyzed'
    });
    
    // Generar documento final
    await documentService.generatePropertyDocument({
      propertyId: userSession.propertyId,
      analysis: analysis,
      route: userSession.currentRoute,
      images: userSession.imageFiles
    });
    
    // Respuesta al usuario
    await sendMessage(fromNumber, `✅ Análisis completado para ${userSession.propertyId}

📊 ANÁLISIS INTELIGENTE:
${analysis.generatedDescription}

📁 Todos los archivos han sido organizados en Google Drive.
🤖 Análisis IA completado con ${Math.round(analysis.confidence * 100)}% de confianza.`);
    
  } catch (error) {
    console.error('❌ Error en análisis final:', error);
    await sendMessage(fromNumber, 'Error completando el análisis. Los archivos se guardaron correctamente.');
  }
}
```

## 🎯 PROMPTS OPTIMIZADOS

### PARA ANÁLISIS DE TEXTO:
- **Contexto específico** del tipo de propiedad
- **Extracción estructurada** en JSON
- **Campos obligatorios** con valores por defecto
- **Nivel de confianza** para cada extracción

### PARA ANÁLISIS DE IMÁGENES:
- **Identificación de espacios** (cocina, baño, habitaciones)
- **Estado de la propiedad** (nuevo, usado, etc.)
- **Elementos destacados** visualmente
- **Recomendaciones** para mejores fotos

### PARA DESCRIPCIÓN FINAL:
- **Combina** análisis de texto e imagen
- **Tono profesional** pero atractivo
- **Call to action** específico por tipo de operación
- **Máximo 300 palabras** para legibilidad

## ⚙️ CONFIGURACIÓN RAILWAY

```bash
# Variable de entorno
railway variables set GEMINI_API_KEY=AIzaSyC-abc123...

# Verificar en código
console.log('Gemini API:', process.env.GEMINI_API_KEY ? 'Configurado ✅' : 'No configurado ❌');
```

## 🚨 MANEJO DE ERRORES

### Rate Limiting:
```typescript
async analyzeWithRetry(prompt: string, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.model.generateContent(prompt);
    } catch (error) {
      if (error.message.includes('quota') && attempt < maxRetries) {
        await this.delay(2000 * attempt); // Backoff exponencial
        continue;
      }
      throw error;
    }
  }
}
```

### Respuestas inválidas:
```typescript
private validateAnalysis(analysis: any): boolean {
  return (
    analysis &&
    typeof analysis === 'object' &&
    'precio' in analysis &&
    'descripcion' in analysis
  );
}
```
