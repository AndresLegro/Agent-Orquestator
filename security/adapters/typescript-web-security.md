# Adaptador de seguridad: TypeScript, HTTP y navegador

> Aplicación genérica de `../standards/application-security.md` a servicios TypeScript, APIs HTTP y clientes web. Los proveedores, librerías y comandos concretos pertenecen a un perfil de proyecto.

## Servicios HTTP

- Validar requests mediante esquemas estrictos antes de los casos de uso; limitar cuerpo, archivos, paginación y profundidad de filtros.
- Usar tipos estrictos y evitar `any` en límites de transporte, persistencia y deserialización.
- Centralizar autenticación, autorización, normalización de errores, CORS y cabeceras de seguridad.
- Usar APIs de persistencia parametrizadas y revisar que ningún flujo concatene entrada no confiable en consultas, comandos o filtros ejecutables.
- Verificar firma y timestamp de eventos externos sobre el cuerpo original, antes de parsear o persistir efectos.
- Aplicar limitadores compartidos para operaciones sensibles y costosas; el límite en memoria solo sirve para desarrollo o una única réplica documentada.

## Aplicaciones web

- Escapar la salida por contexto y evitar APIs que inserten HTML sin saneamiento validado.
- Mantener tokens sensibles fuera de almacenamiento accesible a JavaScript; preferir sesiones protegidas por cookies seguras cuando la arquitectura lo permita.
- Configurar CSP, `frame-ancestors`, `nosniff`, políticas de permisos y redirecciones seguras desde el servidor o CDN.
- Tratar guardas de rutas y validaciones del cliente como experiencia de usuario, no como autorización.
- Revisar dependencias de UI, sanitizadores, cargadores de archivos y renderizadores de contenido como superficie de ataque.

## Pruebas defensivas

- Ejecutar suites de integración contra procesos reales, base aislada y configuración de seguridad equivalente al entorno objetivo.
- Para inyección y XSS, usar corpus interno aprobado de entradas de prueba no ofensivas; verificar respuesta segura, estado persistido, consultas parametrizadas y ausencia de ejecución en un navegador automatizado.
- Para fuerza bruta, usar una secuencia limitada de intentos de prueba con identidades sintéticas; verificar rate limit, respuesta no enumeradora, auditoría y recuperación controlada.
- Para resiliencia ante abuso, usar un generador de carga con límite explícito de solicitudes, concurrencia, duración y tasa. Detener la ejecución ante degradación no prevista; nunca apuntar a producción compartida.
- Confirmar con logs, métricas y almacenamiento que el control se aplicó realmente, no solo que el cliente recibió un error.

## Herramientas y evidencia

- Integrar SAST, escaneo de dependencias, detección de secretos y pruebas de contratos en CI.
- Ejecutar DAST autenticado únicamente contra entornos autorizados y aislados, con alcance y tasa definidos.
- Conservar reportes redactados, versiones de herramientas, configuración, alcance, fecha y resultado de cada verificación.
- Crear pruebas de regresión al corregir una vulnerabilidad, usando el mismo oráculo que detectó el defecto sin publicar material de explotación.
