# Configuración de Variables de Entorno para Convex

## 📋 Resumen

Se han creado los archivos necesarios para configurar Convex con variables de entorno en Expo.

## 📁 Archivos Creados

1. **`env.example`** - Plantilla de variables de entorno
2. **`lib/convex.ts`** - Cliente de Convex configurado para Expo
3. **`convex.json`** - Configuración de Convex
4. **`CONVEX_SETUP.md`** - Guía completa de configuración
5. **`.gitignore`** - Actualizado para ignorar archivos `.env`

## 🚀 Pasos Rápidos

### 1. Crear archivo .env

**Opción A - Manual:**
```bash
cp env.example .env
```

**Opción B - Script (Windows PowerShell):**
```powershell
.\scripts\setup-env.ps1
```

**Opción C - Script (Linux/Mac):**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

### 2. Inicializar Convex

```bash
npx convex dev
```

Este comando te dará una URL como:
```
https://tu-proyecto.convex.cloud
```

### 3. Configurar .env

Abre el archivo `.env` y agrega tu URL:

```env
EXPO_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud
```

**⚠️ IMPORTANTE:** En Expo, las variables de entorno deben tener el prefijo `EXPO_PUBLIC_` para ser accesibles en el código.

### 4. Reiniciar Expo

Después de configurar `.env`, reinicia el servidor:

```bash
npm start
```

## 📝 Estructura del .env

El archivo `.env` debe contener:

```env
# Convex Configuration
EXPO_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud
```

## 🔧 Uso en el Código

El cliente de Convex ya está configurado en `lib/convex.ts`. Úsalo así:

```typescript
import { ConvexProvider, useQuery, useMutation } from '../lib/convex';
import { api } from '../convex/_generated/api';

// Envolver tu app con el provider
<ConvexProvider client={convexClient}>
  {/* Tu app */}
</ConvexProvider>

// Usar queries y mutations
function MyComponent() {
  const data = useQuery(api.myFunction);
  const mutate = useMutation(api.myMutation);
}
```

## ✅ Verificación

Para verificar que todo está configurado correctamente:

1. ✅ Archivo `.env` existe (no se sube a Git)
2. ✅ `EXPO_PUBLIC_CONVEX_URL` está configurado
3. ✅ Convex está inicializado (`npx convex dev`)
4. ✅ El servidor de Expo se reinició después de crear `.env`

## 🐛 Solución de Problemas

### Error: "CONVEX_URL not found"

- Verifica que el archivo `.env` existe
- Verifica que la variable se llama `EXPO_PUBLIC_CONVEX_URL` (con el prefijo)
- Reinicia el servidor de Expo después de crear/modificar `.env`

### Error: "Cannot connect to Convex"

- Verifica que `npx convex dev` está corriendo
- Verifica que la URL en `.env` es correcta
- Verifica tu conexión a internet

## 📚 Recursos

- [Documentación de Convex](https://docs.convex.dev)
- [Convex con React Native](https://docs.convex.dev/client/react/react-native)
- [Variables de Entorno en Expo](https://docs.expo.dev/guides/environment-variables/)





