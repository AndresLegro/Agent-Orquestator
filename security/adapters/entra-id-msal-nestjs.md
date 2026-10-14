# Adaptador de seguridad: Microsoft Entra ID con MSAL (SPA) y NestJS (API)

> Aplicación genérica de `../standards/application-security.md` a productos con
> frontend SPA y backend API que necesitan autenticación corporativa con
> Microsoft Entra ID. Los valores concretos (tenant, client ID, scopes,
> nombres de variables adicionales) pertenecen al perfil de cada proyecto.

## Modelo

- El frontend autentica al usuario con MSAL (Authorization Code Flow + PKCE,
  nunca implicit flow) y solicita un `access_token` con scope propio de la API.
- Cada petición al backend viaja con `Authorization: Bearer <access_token>`.
- El backend valida firma (JWKS remoto), issuer, audience, expiración y scope
  antes de construir un usuario autenticado interno.
- La autorización de negocio (qué puede hacer ese usuario) vive siempre en el
  backend. Las guardas de ruta del frontend son experiencia de usuario, nunca
  el control real.
- El cierre de sesión de la app es local: limpia cuenta y caché de MSAL, y las
  claves propias de `localStorage`/`sessionStorage` con prefijo de la
  aplicación. No cierra la sesión global de Microsoft 365 salvo que el
  producto lo requiera explícitamente.

## App registration en Entra ID

- Tipo de cuenta: single tenant, salvo que el producto deba aceptar múltiples
  tenants.
- Plataforma frontend: Single-page application (SPA), redirect URIs exactas
  por ambiente, sin comodines. `http://localhost` solo en desarrollo local;
  HTTPS en todo lo compartido.
- API expuesta con un scope delegado mínimo (`access_as_user`), Application ID
  URI `api://<client-id>`.
- Ningún secreto en el frontend: una SPA es un cliente público.
- Si los ambientes están estrictamente separados, preferir una app
  registration por ambiente (`dev`, `qa`, `prod`).

## Modo desarrollo (`AUTH_MODE`)

Para poder verificar el producto en el navegador sin depender de un tenant
real, este adaptador define un interruptor por variable de entorno,
simétrico entre frontend y backend, sin ningún endpoint de "login de
desarrollo":

Frontend (Vite):

```text
VITE_AUTH_MODE=entra   # o "dev"
VITE_ENTRA_CLIENT_ID=<client-id>
VITE_ENTRA_AUTHORITY_TENANT=<tenant-id>
VITE_ENTRA_REDIRECT_URI=http://localhost:3000/
VITE_ENTRA_API_SCOPE=api://<client-id>/access_as_user
```

Backend:

```text
NODE_ENV=development
AUTH_MODE=entra   # o "dev"
ENTRA_TENANT_ID=<tenant-id>
ENTRA_CLIENT_ID=<client-id>
ENTRA_ALLOWED_AUDIENCES=<client-id>,api://<client-id>
ENTRA_REQUIRED_SCOPES=access_as_user
DEV_USER_EMAIL=dev.user@contoso.com
DEV_USER_DISPLAY_NAME=Dev User
```

Reglas del modo dev:

- `AUTH_MODE=dev` construye un `AuthenticatedUser` fijo a partir de
  `DEV_USER_EMAIL`/`DEV_USER_DISPLAY_NAME`, sin exigir ni validar ningún
  `Bearer`. No hay endpoint que emita tokens: el modo dev no negocia nada con
  el backend, simplemente no exige la negociación.
- El backend **falla al arranque** (no en tiempo de request) si
  `AUTH_MODE=dev` y `NODE_ENV=production` coinciden.
- La UI debe mostrar de forma visible que está en modo dev (banner, badge o
  equivalente) cuando el perfil del proyecto lo requiera.
- El modo dev no reemplaza la autorización interna: si el backend tiene roles
  o permisos propios, se siguen aplicando sobre el `AuthenticatedUser` que
  construye el modo dev.

## Validación en el backend (NestJS)

Un único guard con dos ramas, seleccionadas por `AUTH_MODE`, para que
controllers y casos de uso no conozcan el modo:

- `entra`: `jose` + JWKS remoto
  (`https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys`);
  valida issuer (`https://login.microsoftonline.com/<tenant-id>/v2.0`),
  audience, expiración y que `scp` incluya el scope requerido; rechaza tokens
  app-only si la API espera usuario interactivo.
- `dev`: construye el usuario fijo descrito arriba.

Ambas ramas producen el mismo contrato interno:

```ts
interface AuthenticatedUser {
  id: string;
  email: string | null;
  displayName: string | null;
  tenantId: string | null;
  source: 'entra' | 'dev';
}
```

Dependencias: `jose` (validación JWT y JWKS), `zod` (validar variables de
entorno al arranque), `@nestjs/config` si el proyecto usa NestJS.

## Cliente en el frontend

- Centralizar MSAL (o el adaptador dev) en un único módulo `auth`; centralizar
  el cliente HTTP en un único `apiClient` que adjunta el `Authorization` en
  cada llamada. Ninguna pantalla pide tokens por su cuenta.
- Scopes de login: `['openid', 'profile', 'email', apiScope]`. Scopes de
  llamadas a la API: `[apiScope]`.
- Ante `401`, reintentar una vez con `acquireTokenSilent({ forceRefresh: true
  })`; si vuelve a fallar, limpiar sesión local y pedir login de nuevo.
- Dependencias: `@azure/msal-browser` (control fino) o adicionalmente
  `@azure/msal-react` si el equipo prefiere hooks oficiales.

## Buenas prácticas obligatorias

- Authorization Code Flow con PKCE; nunca implicit flow.
- Sin client secrets en el frontend; sin tokens en query string; `id_token`
  nunca se usa como credencial de API.
- Backend con tenant específico, nunca `common` en producción.
- CORS con orígenes explícitos, nunca `*` en ambientes corporativos.
- No imprimir tokens ni claims completos en logs.
- `401` (no autenticado) y `403` (autenticado sin permiso) se manejan distinto.

## Pruebas mínimas

- Sin token → `401`. Token expirado → `401`. Token de otro tenant → `401`.
  Audience incorrecta → `401`. Sin el scope requerido → `401`.
- Token válido y usuario autorizado → `200`. Usuario autenticado sin permiso
  interno → `403`.
- Logout local borra el estado de la app y no cierra la sesión de Microsoft 365.
- `AUTH_MODE=dev` con `NODE_ENV=production`: el proceso no arranca.

## Referencias oficiales

- [MSAL Browser](https://learn.microsoft.com/en-us/entra/msal/javascript/browser/about-msal-browser)
- [SPA con authorization code flow y PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/migrate-spa-implicit-to-auth-code)
- [Exponer scopes en una API protegida](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-protected-web-api-expose-scopes)
- [OAuth 2.0 authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Logout con MSAL Browser](https://learn.microsoft.com/entra/msal/javascript/browser/logout)
