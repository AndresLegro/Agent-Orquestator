# Cómo implementar software con la arquitectura de agentes

Este documento define cómo coordinar agentes especializados para construir o mantener un producto con evidencia de calidad, seguridad y operabilidad.

La estructura del repositorio y el orden de lectura están en `README.md`. El contrato común obligatorio está en `AGENTS.md`.

## Qué debe llevar cada perfil

Los estándares reutilizables viven en el repositorio `Agents`. Cada proyecto crea perfiles técnicos solo para decisiones, contratos y procedimientos que no se puedan deducir directamente de su código.

| Perfil | Debe definir |
|---|---|
| Backend | Arquitectura, API, persistencia, migraciones, permisos, integraciones, índices, caché, trabajo asíncrono y límites de pool. |
| Frontend | Framework, design system, rutas, estado, i18n, accesibilidad, presupuesto de bundle y política de caché de datos remotos. |
| QA | Entorno efímero, datos de prueba, pruebas de integración obligatorias, E2E críticos, perfil de carga concurrente y gates de CI. |
| Security | Modelo de amenaza, clasificación de datos, estándares aplicables, entornos autorizados, controles obligatorios y límites de tasa. |

Los requisitos de producto —por ejemplo resultados en vivo, roles, ligas, pagos o reservas— viven en `docs/product/` y tickets; no se duplican en perfiles técnicos.

## Flujo de desarrollo

1. **Descubrimiento:** definir objetivo, usuarios, criterios de aceptación, riesgos y volumen esperado de datos y concurrencia.
2. **Diseño:** crear contratos API, modelo de datos con sus índices y patrones de acceso, estrategia de caché, procesos asíncronos, diseño UX y ADRs para decisiones duraderas.
3. **Threat model y estrategia QA antes de codificar:** seguridad y QA definen qué se debe probar, el perfil de carga y cómo se verificará.
4. **Implementación por vertical slice:** backend, frontend y migraciones construyen una funcionalidad completa pequeña.
5. **Validación continua:** QA prueba integración real; seguridad verifica controles desde el inicio, no al final.
6. **Pull request:** ejecutar build, type-check, lint, pruebas unitarias, integración, contrato, E2E crítico, escaneo de dependencias y secretos, además de revisión humana.
7. **Prueba de carga:** ejecutar al menos 100 usuarios concurrentes sobre los flujos críticos en entorno autorizado, revisando latencia, errores, saturación de pools y colas, caché y límites de tasa.
8. **Staging:** usar un entorno reproducible, datos sintéticos de volumen representativo, smoke tests, pruebas de navegación y observabilidad.
9. **Producción:** desplegar de forma reversible, con métricas, alertas, trazas, rollback y revisión posterior.

## Criterios de escalabilidad compartidos

Ninguna funcionalidad se acepta si solo se verificó con un usuario. El coordinador exige evidencia de estos siete puntos, repartidos entre especialidades:

| Requisito | Responsable principal | Evidencia esperada |
|---|---|---|
| Acceso a datos indexado y consultas óptimas | Backend | Plan de ejecución revisado, índices justificados, paginación y ausencia de consultas en bucle. |
| Estrategia de caché con invalidación | Backend y Frontend | Clave, TTL, invalidación tras mutación, aislamiento por identidad y métricas de aciertos. |
| Procesos pesados en asíncrono | Backend y Frontend | Operación fuera de la ruta crítica, estado consultable y interfaz que no se bloquea. |
| Prueba de carga con 100 usuarios concurrentes | QA | Perfil declarado, umbrales, resultados, cuellos de botella y riesgo residual. |
| Connection pooling dimensionado | Backend | Límites configurados, suma de pools por debajo de la capacidad de la fuente y timeouts definidos. |
| Logs y monitoreo para causa raíz | Backend y DevOps | Correlación propagada, métricas por operación, alertas y diagnóstico sin reproducción manual. |
| Límites de tasa ante abuso | Security y Backend | Controles por identidad, origen y operación, verificados bajo concurrencia y auditados. |

Cuando un requisito no aplique, se registra la justificación con responsable y fecha de revisión.

## Regla esencial

Los agentes no deben trabajar en cadena aislada. Debe existir un coordinador técnico que lea requisitos, perfiles, ADRs y contratos; distribuya el trabajo; y no acepte una funcionalidad hasta que backend, frontend, QA y seguridad hayan aportado evidencia verificable.

Este modelo evita que el frontend simule una capacidad que el backend no soporta, que QA pruebe mocks irreales o que seguridad llegue cuando ya es costoso corregir.
