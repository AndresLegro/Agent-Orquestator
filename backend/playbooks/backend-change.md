# Playbook: cambio backend

Usar este procedimiento para una capacidad nueva, modificación de contrato, integración externa, persistencia o flujo automatizado.

## 1. Descubrimiento

- Leer `AGENTS.md`, la arquitectura vigente, el estándar backend, el adaptador técnico y las instrucciones locales del servicio.
- Identificar productor, consumidor, datos, autorización, dependencias externas y efectos salientes.
- Confirmar contratos, estados actuales y criterios de aceptación con evidencia de código o documentación vigente.
- Detenerse y pedir aclaración cuando una decisión de negocio, seguridad o datos no sea verificable.

## 2. Diseño mínimo

- Delimitar dominio, caso de uso, puertos y adaptadores afectados.
- Definir validación de entrada, salida, errores, autorización, idempotencia y observabilidad.
- Listar los DTOs de entrada y de salida de cada endpoint, webhook o job (nombre, campos, nulabilidad y restricciones) antes de escribir el controller. Sin esa lista el diseño no está completo.
- Definir el modelo de acceso a datos: consultas, índices requeridos, paginación, volumen esperado y plan de ejecución a revisar.
- Decidir qué se cachea, con qué clave, TTL e invalidación, y qué trabajo costoso se ejecuta de forma asíncrona fuera de la petición.
- Establecer límites de pool, concurrencia, timeouts y tasa aplicables al cambio.
- Diseñar compatibilidad o migración si cambia un contrato, esquema, evento o herramienta.
- Registrar un ADR antes de implementar si el cambio altera un límite arquitectónico, proveedor, seguridad, persistencia o entrega.

## 3. Implementación

- Construir la lógica de negocio en el dominio o caso de uso adecuado.
- Implementar o adaptar puertos en infraestructura.
- Mantener los controladores, webhooks y jobs como adaptadores de transporte.
- Crear primero los DTOs de entrada y de salida (un archivo por DTO) y después el controller, que solo los recibe y devuelve. No se entrega un endpoint con parámetros sueltos ni que devuelva una entidad o fila de datos.
- Añadir solo la configuración necesaria y verificar que secretos no lleguen a código ni logs.
- Para IA, validar backend de cada prerequisito y mutación; no depender de reglas de prompt como control de seguridad.

## 4. Pruebas

- Añadir o actualizar pruebas unitarias para invariantes y decisiones de negocio cambiadas.
- Probar adaptadores e integraciones con contratos reales o entornos controlados.
- Probar rutas críticas de extremo a extremo cuando cambia transporte, autorización, datos o efectos salientes.
- Incluir duplicados, reintentos, errores de proveedor y autorización negativa cuando sean relevantes.
- Ejecutar la prueba de arquitectura de DTOs (`templates/dto-contract-guard/`) y añadir, por endpoint, la aserción de claves exactas de la respuesta y la de que un campo extra de la entidad no se filtra. Si la guardia no existe en el proyecto, instalarla antes de continuar.
- Verificar el plan de ejecución de las consultas afectadas con volumen representativo.
- Ejecutar una prueba de carga de al menos 100 usuarios concurrentes sobre los flujos críticos afectados, en entorno autorizado, y revisar latencia, errores, saturación de pools, colas y caché.

## 5. Verificación de entrega

- Ejecutar formato en modo check, análisis estático, build y suites relevantes.
- Revisar migraciones, permisos y metadata desde un entorno limpio cuando apliquen.
- Verificar logs, métricas, health checks, configuración obligatoria y comportamiento de rollback.
- Confirmar que los logs y trazas emitidos permiten identificar la causa exacta de los errores observados durante la prueba de carga.
- Actualizar README, contratos, ADRs y runbooks afectados.
- Informar archivos modificados, comandos ejecutados, resultados y validaciones que aún requieran entorno externo.
