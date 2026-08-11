# Agent Mobile

Aplicación móvil React Native con Expo para el rol de **Operator** del sistema Agent API.

## 📱 Características

- Autenticación con JWT
- Gestión de eventos (crear, ver, actualizar, resolver)
- Interfaz con Material Design (React Native Paper)
- Tema consistente con el frontend web
- Almacenamiento seguro de tokens

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI (se instala automáticamente)
- App Expo Go en tu celular (iOS o Android)

### Instalación

1. Clonar el repositorio:
```bash
git clone https://gitlab.com/lucas.ped.design1984/agent-mobile.git
cd agent-mobile
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar la URL de la API:
   - Editar `src/utils/constants.ts`
   - Cambiar `API_BASE_URL` por la URL de tu API
   - Para desarrollo local, usar tu IP local (no localhost)
   - Ejemplo: `http://192.168.1.100:8000/api/v1`

4. Iniciar el proyecto:
```bash
npm start
```

5. Escanear el código QR con Expo Go:
   - iOS: Cámara nativa
   - Android: App Expo Go

## 📁 Estructura del Proyecto

```
agent-mobile/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── context/         # Contextos de React (Auth)
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # Configuración de navegación
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/        # Login
│   │   └── events/       # Gestión de eventos
│   ├── services/         # Servicios API (axios)
│   ├── theme/           # Tema de React Native Paper
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades y constantes
├── App.tsx              # Componente principal
└── package.json
```

## 🎨 Tema

El tema usa los mismos colores que el frontend web:
- **Primary**: `#3a55b4` (Azul)
- **Secondary**: `#81de76` (Verde)
- **Background**: `#F3F6F4` (Gris claro)

## 📚 Pantallas Implementadas

1. **LoginScreen** - Autenticación de usuarios
2. **HomeScreen** - Pantalla de inicio con acciones rápidas
3. **EventsListScreen** - Lista de eventos del operador
4. **EventDetailScreen** - Detalle de un evento
5. **CreateEventScreen** - Crear nuevo evento

## 🔧 Configuración de Desarrollo

### Para conectar con API local

1. Encuentra tu IP local:
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` o `ip addr`

2. Actualiza `src/utils/constants.ts`:
```typescript
export const API_BASE_URL = 'http://TU_IP_LOCAL:8000/api/v1';
```

3. Asegúrate de que tu API esté corriendo y accesible desde tu red local

## 📦 Dependencias Principales

- **expo**: Framework React Native
- **react-native-paper**: Material Design components
- **axios**: Cliente HTTP para API
- **@react-navigation/native**: Navegación
- **expo-secure-store**: Almacenamiento seguro de tokens

## 🛠️ Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Inicia en Android
- `npm run ios` - Inicia en iOS (requiere Mac)
- `npm run web` - Inicia en navegador web

## 🔐 Autenticación

La app usa JWT tokens almacenados de forma segura con `expo-secure-store`. Los tokens se agregan automáticamente a todas las peticiones HTTP.

## 📝 Próximos Pasos

- [ ] Implementar subida de archivos (imágenes, audio)
- [ ] Implementar chat con IA (futuro)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Sincronización de datos

## 🤝 Contribuir

1. Crear branch desde `develop`
2. Hacer cambios
3. Commit y push
4. Crear Merge Request

## 📄 Licencia

Propietario


