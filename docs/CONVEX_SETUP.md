# Configuración de Convex para Teo

## Pasos para configurar Convex

### 1. Instalar Convex CLI (si no lo tienes)

```bash
npm install -g convex
```

### 2. Inicializar Convex en el proyecto

```bash
npx convex dev
```

Este comando:

- Te pedirá iniciar sesión o crear una cuenta en Convex
- Creará un archivo `convex/` con la estructura básica
- Te dará una URL de deployment (algo como `https://your-project.convex.cloud`)

### 3. Configurar variables de entorno

1. Copia el archivo de ejemplo:

   ```bash
   cp env.example .env
   ```

2. Abre `.env` y pega tu URL de Convex:

   ```
   EXPO_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
   ```

3. **Importante**: En Expo, las variables de entorno deben tener el prefijo `EXPO_PUBLIC_` para ser accesibles en el código de React Native.

### 4. Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno, reinicia Expo:

```bash
npm start
```

## Uso en el código

El cliente de Convex ya está configurado en `lib/convex.ts`. Puedes usarlo así:

```typescript
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../convex/_generated/api";

// En un componente
function MyComponent() {
	const data = useQuery(api.myFunction);
	const mutate = useMutation(api.myMutation);

	// ...
}
```

## Estructura de archivos Convex

```
convex/
├── _generated/          # Archivos generados automáticamente
├── schema.ts           # Define el esquema de la base de datos
├── users.ts            # Funciones relacionadas con usuarios
├── groups.ts            # Funciones relacionadas con grupos
└── checkIns.ts         # Funciones relacionadas con check-ins
```

## Recursos

- [Documentación de Convex](https://docs.convex.dev)
- [Convex con React Native](https://docs.convex.dev/client/react/react-native)
- [Dashboard de Convex](https://dashboard.convex.dev)
