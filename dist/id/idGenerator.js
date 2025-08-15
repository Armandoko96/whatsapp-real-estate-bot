"use strict";
// Generador de IDs basado en ruta: agente, tipo, operación, sector, colonia, consecutivo
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
function generateId(route, consecutive) {
    // Iniciales: Agente (1), Tipo (1), Operación (1), Sector (2), Colonia (2), Consecutivo (3)
    const agent = route.agent.charAt(0).toUpperCase();
    const type = route.type.charAt(0).toUpperCase();
    const operation = route.operation.charAt(0).toUpperCase();
    const sector = route.sector.split(' ').map(w => w.charAt(0).toUpperCase()).join('').padEnd(2, 'X').slice(0, 2);
    const colony = route.colony.split(' ').map(w => w.charAt(0).toUpperCase()).join('').padEnd(2, 'X').slice(0, 2);
    const num = consecutive.toString().padStart(3, '0');
    return `${agent}${type}${operation}${sector}${colony}${num}`;
}
