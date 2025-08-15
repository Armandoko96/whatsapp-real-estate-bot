"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            throw new Error('GEMINI_API_KEY no configurada');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    // Identifica sector y colonia a partir de texto
    async identifyLocation(text) {
        const prompt = `Dado el siguiente texto de ubicación en Culiacán, identifica el sector y la colonia. Responde solo JSON. Ejemplo: { "sector": "Salida Norte", "colony": "Santa Fe" }\nTexto: "${text}"`;
        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        try {
            return JSON.parse(response);
        }
        catch {
            throw new Error('No se pudo extraer sector y colonia de la respuesta de Gemini: ' + response);
        }
    }
    // Mejora y corrige la descripción
    async improveDescription(description) {
        const prompt = `Corrige ortografía y mejora la redacción de la siguiente descripción inmobiliaria para que sea atractiva y profesional.\n\nTexto: "${description}"`;
        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }
}
exports.GeminiService = GeminiService;
