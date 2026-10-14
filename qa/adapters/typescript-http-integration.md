# Adaptador QA: TypeScript, HTTP e integración

> Aplicación genérica de `../standards/quality-engineering.md` a servicios TypeScript con APIs HTTP. Las librerías, comandos, esquema y servicios concretos pertenecen a un perfil de proyecto.

## Entorno de integración

- Arrancar la aplicación con su composición real de dependencias y configuración exclusiva de pruebas.
- Levantar una base de datos aislada mediante contenedor, proceso local administrado o infraestructura efímera equivalente.
- Aplicar migraciones y semillas desde cero antes de las suites que dependan de persistencia.
- Ejecutar solicitudes HTTP reales contra el proceso iniciado; no llamar controllers o servicios de forma directa cuando se valida transporte, middleware, guards o serialización.
- Cerrar procesos, conexiones, colas y contenedores de forma verificable al terminar.

## Contratos y persistencia

- Tipar payloads de prueba, pero validar también el esquema de respuesta en tiempo de ejecución cuando la frontera lo requiera.
- Verificar código, cabeceras, cuerpo y efectos persistidos tras cada operación relevante.
- Consultar la base de datos real para comprobar invariantes, transacciones, auditoría, permisos y efectos de reintentos.
- Usar identificadores únicos por prueba y limpiar datos por transacción, namespace o destrucción del entorno.
- Probar entradas inválidas, autenticación ausente o inválida, autorización insuficiente y compatibilidad hacia atrás.

## Efectos externos controlados

- Reemplazar servicios remotos por un receptor local controlado solo cuando no exista sandbox o entorno de prueba seguro.
- El receptor debe implementar el protocolo real y conservar cada solicitud para aserciones sobre autenticación, cuerpo, orden, reintentos e idempotencia.
- Mantener pruebas de contrato contra sandbox o proveedor real programadas cuando el protocolo pueda cambiar.
- Simular de forma determinista timeout, error temporal, respuesta inválida y duplicado; verificar recuperación y ausencia de efectos repetidos.

## Pruebas de carga

- Usar un generador de carga que permita declarar usuarios virtuales, tasa de llegada, duración, escalado progresivo y umbrales de aceptación como criterio de fallo.
- Ejecutar con al menos 100 usuarios virtuales concurrentes sobre los recorridos críticos, contra el proceso real y una base de datos con volumen representativo.
- Usar datos e identidades distintas por usuario virtual para no medir únicamente el camino cacheado ni provocar contención artificial.
- Publicar percentiles de latencia, tasa de error y throughput; correlacionar con métricas del servicio como pool de conexiones, colas, memoria y aciertos de caché.
- Verificar tras la ejecución la correctitud de los datos persistidos: sin duplicados, pérdidas de escritura ni registros de un usuario asignados a otro.
- Mantener estos scripts versionados y separados de las suites por cambio; ejecutarlos de forma programada o antes de una entrega crítica.

## Herramientas

- Separar scripts unitarios, integración, carga y extremo a extremo.
- Usar un runner que soporte setup/teardown asíncrono, fixtures aisladas y reportes útiles.
- Usar un cliente HTTP real para las APIs y un driver real para verificar almacenamiento.
- Para flujos web, ejecutar navegador automatizado contra el stack de integración en vez de comprobar solo componentes aislados.

## Verificación

La evidencia mínima de un módulo mutativo incluye solicitud real, respuesta observable, estado persistido, comportamiento ante repetición y efectos externos capturados. Una prueba no se considera de integración si reemplaza simultáneamente el proceso, la persistencia y la frontera que pretende validar.
