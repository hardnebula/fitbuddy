# Configuración de Convex para FitBuddy

## ✅ Configuración Completada

Se ha configurado Convex con las siguientes funcionalidades:

### 📊 Esquema de Base de Datos (`convex/schema.ts`)

1. **users** - Tabla de usuarios
   - Información del usuario (nombre, email, avatar)
   - Estadísticas (streaks, total check-ins)
   - Índices por email y streak

2. **groups** - Tabla de grupos
   - Información del grupo (nombre, código de invitación)
   - Streak del grupo
   - Soporte para archivar grupos

3. **groupMembers** - Relación muchos-a-muchos entre usuarios y grupos
   - Permite múltiples grupos por usuario
   - Máximo 4 miembros activos por grupo
   - Soporte para desactivar miembros

4. **checkIns** - Tabla de check-ins/actividades
   - Check-ins diarios con foto y nota opcionales
   - Relación con usuario y grupo
   - Soporte para archivar check-ins
   - Índices para búsquedas eficientes

### 🔐 Autenticación (`convex/users.ts`)

- `getOrCreateUser` - Crea o obtiene usuario por email
- `getUser` - Obtiene usuario por ID
- `getUserByEmail` - Busca usuario por email
- `updateUser` - Actualiza perfil del usuario
- `updateUserStats` - Actualiza estadísticas (streaks, check-ins)
- `getUserStats` - Obtiene estadísticas del usuario

### 👥 Grupos (`convex/groups.ts`)

- `createGroup` - Crea un nuevo grupo con código de invitación único
- `joinGroup` - Une usuario a grupo por código de invitación
- `getGroup` - Obtiene grupo por ID
- `getGroupByInviteCode` - Busca grupo por código de invitación
- `getUserGroups` - Obtiene todos los grupos del usuario
- `getGroupMembers` - Obtiene miembros de un grupo
- `archiveGroup` - Archiva un grupo (solo el creador)
- `updateGroupStreak` - Actualiza el streak del grupo

### ✅ Check-ins (`convex/checkIns.ts`)

- `createCheckIn` - Crea un check-in diario
  - Previene múltiples check-ins el mismo día
  - Actualiza automáticamente streaks del usuario y grupo
- `getGroupCheckIns` - Obtiene check-ins de un grupo
- `getUserCheckIns` - Obtiene check-ins de un usuario
- `getCheckInsByDateRange` - Obtiene check-ins por rango de fechas
- `hasCheckedInToday` - Verifica si el usuario ya hizo check-in hoy
- `archiveCheckIn` - Archiva un check-in individual
- `archiveCheckIns` - Archiva múltiples check-ins

### 🎣 Hooks de React (`lib/`)

#### `lib/auth.ts`
- `useAuth()` - Hook para autenticación
- `useCurrentUser()` - Hook para obtener usuario actual

#### `lib/groups.ts`
- `useGroups()` - Hook con todas las operaciones de grupos
- `useGroupByInviteCode()` - Hook para buscar grupo por código

#### `lib/checkIns.ts`
- `useCheckIns()` - Hook con todas las operaciones de check-ins
- `useGroupCheckIns()` - Hook para obtener check-ins de grupo
- `useUserCheckIns()` - Hook para obtener check-ins de usuario
- `useHasCheckedInToday()` - Hook para verificar check-in de hoy
- `useCheckInsByDateRange()` - Hook para check-ins por fecha

### 🔄 Contexto de Autenticación (`contexts/AuthContext.tsx`)

- `AuthProvider` - Proveedor de contexto de autenticación
- `useAuthContext()` - Hook para acceder al contexto
- Maneja persistencia con AsyncStorage
- Gestiona estado del usuario actual

## 🚀 Uso en la Aplicación

### Ejemplo: Login de Usuario

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function LoginScreen() {
  const { login } = useAuthContext();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'John Doe');
      // Usuario logueado
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

### Ejemplo: Crear Grupo

```typescript
import { useGroups } from '../lib/groups';
import { useAuthContext } from '../contexts/AuthContext';

function CreateGroupScreen() {
  const { userId } = useAuthContext();
  const { createGroup } = useGroups();

  const handleCreate = async () => {
    if (!userId) return;
    
    const groupId = await createGroup({
      name: 'Morning Runners',
      createdBy: userId,
      memberEmails: ['friend@example.com'],
    });
  };
}
```

### Ejemplo: Hacer Check-in

```typescript
import { useCheckIns } from '../lib/checkIns';
import { useAuthContext } from '../contexts/AuthContext';

function HomeScreen() {
  const { userId } = useAuthContext();
  const { createCheckIn, hasCheckedInToday } = useCheckIns();
  const hasCheckedIn = hasCheckedInToday(userId);

  const handleCheckIn = async () => {
    if (!userId || !groupId) return;
    
    await createCheckIn({
      userId,
      groupId,
      note: 'Great workout!',
      photo: 'base64...',
    });
  };
}
```

### Ejemplo: Archivar Grupo

```typescript
import { useGroups } from '../lib/groups';
import { useAuthContext } from '../contexts/AuthContext';

function GroupSettingsScreen() {
  const { userId } = useAuthContext();
  const { archiveGroup } = useGroups();

  const handleArchive = async () => {
    if (!userId || !groupId) return;
    
    await archiveGroup({
      groupId,
      userId,
    });
  };
}
```

## 📝 Próximos Pasos

1. **Inicializar Convex**:
   ```bash
   npx convex dev
   ```

2. **Configurar variables de entorno**:
   - Copia `env.example` a `.env`
   - Agrega tu `EXPO_PUBLIC_CONVEX_URL`

3. **Integrar en las pantallas**:
   - Actualizar pantallas de auth para usar `useAuthContext`
   - Actualizar pantallas de grupos para usar `useGroups`
   - Actualizar pantalla de home para usar `useCheckIns`

4. **Probar funcionalidad**:
   - Crear usuarios
   - Crear grupos
   - Hacer check-ins
   - Archivar grupos y check-ins

## 🔒 Seguridad

- Los usuarios se identifican por email (puedes agregar autenticación más robusta después)
- Solo el creador del grupo puede archivarlo
- Los check-ins están vinculados a usuarios y grupos específicos
- Los datos archivados se mantienen pero no aparecen en consultas normales

## 📚 Recursos

- [Documentación de Convex](https://docs.convex.dev)
- [Convex con React Native](https://docs.convex.dev/client/react/react-native)
- [Dashboard de Convex](https://dashboard.convex.dev)





