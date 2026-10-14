# Adaptador frontend: React y TypeScript

> Aplicación genérica de `../standards/frontend-engineering.md` a aplicaciones React con TypeScript. Las librerías, rutas, comandos y convenciones de un proyecto pertenecen a su perfil.

## Estructura

- Mantener el punto de arranque mínimo y concentrar proveedores globales, rutas y layout en la capa de plataforma.
- Organizar capacidades por páginas de composición, componentes, hooks, servicios, tipos, mappers y constantes.
- Definir componentes compartidos por su contrato visual y accesible, no por una necesidad de negocio puntual.
- Separar servicios de red, mappers y hooks de datos de los componentes de presentación.

### Estructura base de carpetas

Cada proyecto React parte de este árbol. Dos ideas lo gobiernan: el primer nivel de negocio es una feature autocontenida que se puede borrar entera, y lo compartido se organiza con Atomic Design. Ningún archivo de código queda suelto en la raíz de una feature ni de una capa: siempre vive en una carpeta por responsabilidad.

```
<proyecto>/
  e2e/            pruebas end-to-end y de accesibilidad (solo si existen)
  scripts/        scripts de build y verificación, p. ej. presupuesto de bundle (solo si existen)
  src/
    main.tsx  App.tsx                montaje de proveedores (consulta, i18n, router) y composición
    config/env.ts                    única lectura de las variables de entorno
    styles/                          tokens, fuentes y base global
    assets/                          brand/  images/  fonts/
    lib/                             utilidades sin dependencias de React ni de una feature
      http/                          cliente HTTP, errores del API, cliente de consulta
      auth/                          cliente de autenticación y sus variantes por modo
      format/                        formato de dinero, fechas y números
    components/                      compartido, clasificado por de qué depende cada componente
      atoms/<Componente>/            sin dependencias de otros componentes (Button, Input, Icon)
      molecules/<Componente>/        componen átomos con una responsabilidad (Field, KpiCard, DataTable)
      organisms/<Componente>/        bloques de interfaz completos (barra lateral, cabecera de página)
    layouts/<Layout>/                plantillas de página (shell móvil y de escritorio)
    features/<feature>/              una carpeta por capacidad de negocio
      pages/          página de composición enlazada a la ruta
      components/     componentes de presentación propios de la feature
      hooks/          hooks de datos y de lógica de vista
      services/       llamadas al API de la feature
      types/          modelos del API, del dominio de vista y mappers
      constants/      claves de consulta, valores iniciales y catálogos de la feature
    router/           rutas, router, ruta privada y fallback de carga
    store/            estado global de interfaz, por slices
    i18n/             configuración y claves tipadas
    locales/<idioma>/ un archivo por namespace
    constants/  hooks/  services/  types/    transversales, usados por dos o más features
```

Reglas:

- Cada componente compartido vive en su propia carpeta junto con su estilo (`Button/Button.tsx` y `Button.module.css`).
- El nivel atómico lo decide de qué depende el componente, no su tamaño. Un componente que solo usa una feature vive en esa feature.
- Sube a la raíz (`components/`, `hooks/`, `services/`, `types/`, `constants/`, `lib/`) solo lo que usan dos o más features.
- Una feature no importa de otra feature. Dentro de una feature la dependencia va en un solo sentido: `pages` → `components` y `hooks` → `services` → `types`.
- Sin archivos barril (`index.ts` que reexporta).
- Las pruebas unitarias y de componentes viven junto al archivo que prueban (`x.ts` y `x.spec.ts`).
- Una carpeta existe solo si tiene contenido: una feature sin endpoint propio no lleva `services/` ni `types/` vacíos.
- Los nombres de carpetas y archivos van en inglés; los componentes en `PascalCase`, los hooks como `useX`, y los servicios, tipos y constantes como `<feature>.service.ts`, `<feature>.types.ts` y `<feature>.constants.ts`.
- Si una carpeta supera unas diez entradas, se subdivide por responsabilidad antes de seguir creciendo.

## Estado y datos

- Usar `useState` y `useReducer` para estado local; reservar Context para configuración o dependencias globales estables.
- Usar un store global por slices o dominios únicamente cuando varios subárboles necesiten estado compartido.
- Usar una biblioteca de estado de servidor o hooks dedicados para caché, invalidación, reintentos y sincronización remota.
- Mantener modelos de API y modelos de vista separados por tipos y mappers.
- Usar `useEffect` para sincronizar con sistemas externos, no para derivar estado que puede calcularse durante el renderizado.

## Componentes y accesibilidad

- Tipar props y eventos; evitar `any`, casts amplios y componentes con responsabilidades mezcladas.
- Usar elementos semánticos, `button` y `a` reales para interacción, y nombres accesibles en iconos y campos.
- Gestionar foco, cierre con teclado y restauración de foco en diálogos o superficies modales.
- Preferir tokens de diseño, variantes y composición sobre estilos aislados repetidos.

## Rutas y seguridad

- Centralizar rutas y sus parámetros; proteger una sola vez el subárbol privado para experiencia de navegación.
- Tratar las guardas de ruta como UX. El servidor conserva la autorización efectiva.
- Cargar configuración pública desde variables de build validadas y no exponer secretos en el bundle.
- Usar un cliente HTTP único; evitar solicitudes directas que salten autenticación, manejo de errores o telemetría comunes.

## Rendimiento y escalabilidad

- Definir claves de caché completas en la biblioteca de estado de servidor, incluyendo identidad, filtros, paginación e idioma; invalidar tras cada mutación exitosa.
- Aprovechar la deduplicación de solicitudes concurrentes y cancelar peticiones obsoletas al navegar o cambiar filtros; limpiar la caché al cerrar sesión.
- Dividir el bundle por rutas y módulos pesados mediante carga diferida, y diferir contenido no visible.
- Virtualizar listas y tablas extensas; agrupar o limitar la frecuencia de eventos de alta cadencia.
- Mover cómputo intensivo fuera del hilo principal cuando degrade la respuesta a la interacción.
- Para operaciones largas del servidor, mostrar estado consultable y permitir que el usuario continúe navegando.

## Verificación

Ejecutar desde el directorio del proyecto sus equivalentes no mutantes de:

```bash
format:check
lint
typecheck
build
test
```

Añadir pruebas de componentes y flujos con React Testing Library o una alternativa equivalente; usar un navegador real para verificar navegación, interacción, foco y presentación responsiva.
