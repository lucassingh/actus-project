/**
 * Constantes de la aplicación
 */

// URL base de la API
// Para desarrollo local, usa tu IP local en lugar de localhost
// IMPORTANTE: localhost NO funciona desde el celular, debes usar tu IP local
// 
// 📋 INSTRUCCIONES:
// 1. Abre PowerShell y ejecuta: ipconfig
// 2. Busca "IPv4 Address" (ejemplo: 192.168.1.100)
// 3. Reemplaza la IP de abajo con la tuya
// 4. Si tu backend corre en puerto 80, deja PORT vacío o usa 80
// 5. Si tu backend corre en otro puerto (ej. 8000), especifícalo
//
// Ejemplos:
// - Puerto 80 (HTTP por defecto): 'http://192.168.0.5/api/v1'
// - Puerto 8000: 'http://192.168.0.5:8000/api/v1'
const YOUR_LOCAL_IP: string = '192.168.1.35'; // ⚠️ CAMBIAR POR TU IP LOCAL
const API_PORT: string = '3001'; // Puerto del backend Next.js (actus-v2 apps/web)

// Construir URL base
const buildApiUrl = (ip: string, port: string): string => {
  // Si el puerto está vacío o es '80', no incluir puerto (HTTP por defecto)
  if (!port || port === '' || port === '80') {
    return `http://${ip}/api/v1`;
  }
  // Remover ':' si está incluido y agregar puerto
  const portNumber = port.replace(':', '');
  return `http://${ip}:${portNumber}/api/v1`;
};

export const API_BASE_URL = __DEV__
  ? buildApiUrl(YOUR_LOCAL_IP, API_PORT)
  : 'https://tu-api-produccion.com/api/v1';

// Log de la URL configurada (solo en desarrollo)
if (__DEV__) {
  console.log('🔗 API Base URL configurada:', API_BASE_URL);
  const isExampleIP = YOUR_LOCAL_IP === '192.168.1.100' || 
                      YOUR_LOCAL_IP === 'localhost' || 
                      YOUR_LOCAL_IP === '127.0.0.1';
  if (isExampleIP) {
    console.warn('⚠️ ADVERTENCIA: Estás usando una IP de ejemplo o localhost.');
    console.warn('📝 Por favor, cambia YOUR_LOCAL_IP en src/utils/constants.ts por tu IP real.');
    console.warn('💡 Para encontrar tu IP: Windows: ipconfig | Mac/Linux: ifconfig');
  } else {
    console.log('✅ IP local configurada correctamente:', YOUR_LOCAL_IP);
  }
}

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  OPERATOR: 'OPERATOR',
} as const;

// Estados de eventos (UPPERCASE — Prisma enums)
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

// Tipos de eventos (UPPERCASE — Prisma enums)
export const EVENT_TYPES = {
  INCIDENT: 'INCIDENT',
  MAINTENANCE: 'MAINTENANCE',
  CONTROL: 'CONTROL',
} as const;

// Prioridades (UPPERCASE — Prisma enums)
export const PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

