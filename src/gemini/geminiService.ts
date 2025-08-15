import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Identifica sector y colonia a partir de texto
  async identifyLocation(text: string): Promise<{ sector: string; colony: string }> {
    const prompt = `Dado el siguiente texto de ubicación en Culiacán, identifica el sector y la colonia. Responde solo JSON. Ejemplo: { "sector": "Salida Norte", "colony": "Santa Fe" }\nTexto: "${text}"`;
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    try {
      return JSON.parse(response);
    } catch {
      throw new Error('No se pudo extraer sector y colonia de la respuesta de Gemini: ' + response);
    }
  }

  // Mejora y corrige la descripción
  async improveDescription(description: string): Promise<string> {
    const prompt = `Corrige ortografía y mejora la redacción de la siguiente descripción inmobiliaria para que sea atractiva y profesional.\n\nTexto: "${description}"`;
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
