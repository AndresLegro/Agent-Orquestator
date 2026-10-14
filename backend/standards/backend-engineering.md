# Estándar de ingeniería backend

> Principios canónicos para servicios backend, independientes de lenguaje y framework.
>
> Complementa los adaptadores en `../adapters/` y los perfiles de proyecto en `../profiles/`.

## 1. Resultado esperado

Un backend debe preservar reglas de negocio, contratos confiables, seguridad y operabilidad. La estructura se organiza por capacidad de negocio, no por tecnología compartida ni por conveniencia del transporte.

---

## 2. Estructura de módulos

Cada módulo vive en `src/modules/<nombre-modulo>/` con la siguiente estructura obligatoria:

```
src/modules/<nombre-modulo>/
├── domain/
│   ├── entities/
│   │   └── <entidad>.d.ts
│   └── repositories/
│       └── <nombre>.repository.ts
├── application/
│   ├── dtos/
│   │   └── <accion>-<entidad>.dto.ts
│   └── use-cases/
│       └── <accion>-<entidad>.use-case.ts
└── infrastructure/
    ├── controller/
    │   └── <nombre>.controller.ts
    ├── persistence/
    │   └── <fuente>-<nombre>.repository.impl.ts
    └── <nombre>.module.ts
```

No se permite:
- Mezclar capas (lógica de negocio en controller)
- Crear archivos fuera de esta estructura
- Omitir capas

---

## 3. Reglas por capa

### Domain
- Solo interfaces, tipos y el token de inyección
- Cero imports de NestJS (excepto tipos)
- El token se exporta como constante string en el mismo archivo de la interfaz

### Application (use-cases)
- Toda la lógica de negocio vive aquí
- Usa `@Inject(TOKEN)` para el repositorio
- Nunca hace llamadas HTTP directas
- Lanza excepciones de NestJS: `BadRequestException`, `NotFoundException`, `ConflictException`

### Application (DTOs)
Los DTOs son obligatorios en **ambos sentidos** de toda frontera de transporte (sección 6, "DTOs obligatorios"):
- **DTO de entrada (request):** uno por operación y por fuente (`@Query`, `@Param`, `@Body`).
- **DTO de salida (response):** uno por forma pública devuelta; se construye desde la entidad con un mapeo explícito (`static fromEntity(...)`) campo por campo.
- Un archivo por DTO — un DTO por archivo (SRP)
- DTOs de entrada: validación con `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsEmail()`, etc.); propiedades obligatorias con `!` y opcionales con `?` y `@IsOptional()`. Un valor por defecto va en el inicializador de la propiedad, no repetido en el controller.
- DTOs de salida: solo propiedades con `!`, sin lógica ni decoradores de persistencia; son una lista blanca de lo que el consumidor puede ver.
- Los envoltorios genéricos y reutilizables (`{ result, message, response }`, página, conteo) viven en un módulo compartido de transporte, no se duplican por módulo.

### Infrastructure (controller)
- Solo recibe, valida y delega al use-case
- Cero lógica de negocio
- Todo parámetro `@Body()`, `@Query()` o `@Param()` se tipa con una clase `*Dto`; nunca con un tipo primitivo, un tipo literal en línea ni `Record<...>`
- Todo handler declara su tipo de retorno y este es un DTO de salida (o un envoltorio de DTOs); nunca devuelve una entidad de dominio, una fila de base de datos ni un objeto literal sin tipo
- No importa entidades de dominio: el mapeo entidad → DTO ocurre en el DTO de salida (capa de aplicación)
- Usa `@UseGuards(JwtAuthGuard)` en todos los endpoints protegidos
- Respuesta siempre con estructura `{ result: true, message: 'OK', response: { ... } }`

## 4. Límites de arquitectura

Cada capacidad mantiene tres responsabilidades separadas:

- **Dominio:** conceptos, invariantes, políticas, errores y contratos que representan el negocio. No conoce HTTP, bases de datos, SDKs, colas ni frameworks.
- **Aplicación:** casos de uso que coordinan el dominio y sus puertos. Define entradas y salidas del caso de uso, transacciones, autorización de negocio e idempotencia.
- **Infraestructura:** controladores, jobs, webhooks, repositorios, clientes de proveedores, serialización y configuración. Implementa puertos y traduce detalles externos.

Un controlador, webhook o job valida la entrada, construye un comando y delega. Un caso de uso no recibe objetos HTTP ni llama SDKs directamente. Un adaptador no decide políticas de negocio.

### Dependencias permitidas

`infrastructure → application → domain`

El dominio no depende de capas exteriores. La aplicación depende de puertos declarados por el dominio o por la propia aplicación, no de adaptadores concretos. La composición de dependencias ocurre en el módulo o punto de arranque.

## 5. Casos de uso y módulos

- Un caso de uso expresa una intención concreta y una única razón principal para cambiar.
- Los módulos publican contratos o fachadas explícitas; no se importan servicios internos de otro módulo como atajo.
- Las variaciones por proveedor, canal o cliente se resuelven mediante configuración, estrategia o adaptador, nunca con ramas específicas por cliente.
- La abstracción se introduce cuando existen al menos dos variaciones reales o una frontera externa que aislar.
- Mantener el estado conversacional, de proceso o de caché detrás de una interfaz con ciclo de vida y persistencia explícitos.

## 6. Contratos y validación

- Tratar como no confiable toda entrada HTTP, webhook, cola, archivo, variable de entorno y respuesta de proveedor.
- Validar y normalizar en la frontera antes de invocar negocio; rechazar propiedades, formatos y tamaños no permitidos.
- Usar comandos y respuestas con significado de negocio. No filtrar modelos internos ni errores crudos de proveedores.
- Evolucionar contratos de forma compatible o versionada. Documentar consumidores, productores y estrategia de migración antes de romperlos.
- Diferenciar de forma explícita dato faltante, estado bloqueado, recurso inexistente, conflicto y resultado vacío. Nunca convertir un prerequisito faltante en un resultado funcional vacío.

### DTOs obligatorios en toda frontera de transporte

Es seguridad básica, no estilo: el DTO de entrada impide que llegue lo que no se declaró, y el de salida impide que salga lo que no se quiso mostrar. Reglas, todas verificables:

1. **Entrada con DTO.** Todo dato que llega por HTTP, webhook, cola o job se recibe como una clase DTO validada. Prohibido leer `@Param('id') id: string`, `@Query('x')`, `@Body()` sin clase, `req.body` o parámetros sueltos.
2. **Validación estricta.** El pipe global de validación rechaza propiedades no declaradas (lista blanca) y transforma tipos. Cada propiedad lleva sus restricciones (formato, rango, longitud máxima, enumeración); una paginación sin cota superior no existe.
3. **Salida con DTO.** Todo handler devuelve una clase DTO de salida. Prohibido devolver una entidad de dominio, una fila de base de datos, el payload de un proveedor o un objeto literal sin tipo.
4. **Mapeo explícito.** El DTO de salida se construye campo por campo desde la entidad. No se usa `...entity`, `Object.assign` ni un cast para "pasar todo": una columna nueva en la fuente no llega al consumidor hasta que se agrega a propósito.
5. **Nulos con significado.** Un dato ausente se declara como `null` en el DTO y se conserva así; no se convierte en `0`, `''` ni `false`.
6. **Un DTO, una razón.** No se reutiliza el DTO de entrada como DTO de salida ni entre operaciones con reglas distintas.
7. **Contrato documentado.** Los nombres y tipos del DTO de salida son el contrato publicado; un cambio incompatible sigue la regla de evolución de contratos de esta sección.
8. **Prueba automática.** El proyecto incluye la prueba de arquitectura `templates/dto-contract-guard/`, que recorre todos los controllers y falla si alguno incumple 1 o 3, o importa entidades de dominio. Además, la prueba de integración de cada endpoint verifica las claves exactas de la respuesta y que un campo extra de la entidad no se filtra.

Un endpoint sin DTOs no se considera terminado aunque funcione y tenga pruebas de negocio. Esta regla no admite "lo hago después": las excepciones temporales requieren un ADR.

## 7. Persistencia e integraciones

- Encapsular cada fuente externa detrás de un puerto con nombres de negocio.
- Los repositorios aplican consultas y mapeos; no contienen reglas de flujo que pertenezcan al caso de uso.
- Traducir errores del proveedor a una taxonomía estable y preservar la causa de forma segura para diagnóstico.
- Toda escritura con efecto externo debe definir idempotency key, condición de duplicado o compensación.
- Mantener migraciones, esquema, permisos y metadata como artefactos versionados, reproducibles y revisables.
- No registrar secretos, tokens, credenciales ni payloads completos con datos personales salvo un motivo operacional aprobado.
- Toda consulta nueva o modificada se revisa contra el modelo de acceso a datos antes de entregarla, según la sección 11.

## 8. Seguridad

- Autenticación y autorización se aplican por defecto; toda excepción pública se documenta de forma explícita.
- Verificar autenticidad y replay protection en webhooks antes de procesar efectos.
- Separar secretos de código y validar la configuración obligatoria al iniciar.
- Aplicar mínimo privilegio a identidades, bases de datos y proveedores.
- Proteger autenticación basada en cookies frente a CSRF y definir rotación, revocación y caducidad de secretos.
- Limitar tamaño, tasa y superficie de entrada según el tipo de endpoint.
- Analizar dependencias y secretos antes de entregar; generar o conservar un inventario de dependencias cuando el entorno lo requiera.
- Definir retención y borrado seguro de datos personales, conversaciones y artefactos operativos.
- No confiar en decisiones de un LLM para autorizar, mutar datos o saltar prerequisitos. El backend valida las invariantes antes del efecto.

## 9. Flujos con IA y automatización

- El modelo interpreta lenguaje y propone acciones; el backend conserva la autoridad sobre estado, permisos, contratos y mutaciones.
- Persistir los datos de conversación necesarios con tipos explícitos. Diferenciar datos capturados de datos ya validados o resueltos.
- Validar cada llamada de herramienta contra una lista permitida y un esquema estricto.
- Una respuesta de herramienta debe ser estructuralmente completa antes de continuar el flujo. No dejar operaciones parciales ni referencias huérfanas.
- Pedir confirmación explícita antes de operaciones de impacto cuando el dominio lo requiera.
- Diseñar fallos seguros: una respuesta ambigua o incompleta nunca debe producir una mutación o afirmar disponibilidad inexistente.

## 10. Errores y observabilidad

- Usar una taxonomía consistente: validación, autenticación, autorización, no encontrado, conflicto, regla de negocio, dependencia no disponible e inesperado.
- Separar el mensaje seguro para el consumidor del detalle técnico para logs y trazas.
- Emitir logs estructurados con identificador de correlación, operación, resultado y dependencia; evitar `console` disperso.
- Medir latencia, errores, reintentos, dependencias y operaciones de negocio críticas.
- Definir timeouts, reintentos acotados y comportamiento ante indisponibilidad de cada dependencia.

## 11. Escalabilidad y rendimiento

El servicio debe seguir siendo correcto y responsivo con muchos usuarios simultáneos. Esta sección es obligatoria para cualquier cambio que consulte datos, exponga un endpoint o ejecute trabajo costoso.

### Acceso a datos

- Revisar el plan de ejecución de cada consulta nueva o modificada antes de entregarla. Verificar uso de índices, selectividad, orden de filtros, coste estimado y volumen leído frente a volumen devuelto.
- Crear o ajustar índices según los patrones reales de filtrado, ordenamiento, unicidad y agregación. Un índice que no responde a un acceso real es coste de escritura sin beneficio.
- Proyectar solo las columnas necesarias. No recuperar entidades completas ni relaciones expandidas para descartar la mayor parte en memoria.
- Paginar toda lectura de colección con límite máximo. No existe consulta sin cota superior de resultados.
- Eliminar consultas en bucle y cargas N+1 mediante agregación, carga por lotes o consultas conjuntas explícitas.
- Calcular agregados, conteos y sumas en la fuente de datos, no iterando resultados en memoria.
- Cuando la búsqueda dependa de texto, filtros múltiples o relevancia, evaluar índices especializados, vistas materializadas o proyecciones de lectura mantenidas de forma explícita, con su estrategia de actualización y consistencia declarada.
- Medir con volumen representativo de producción. Una consulta correcta con datos de prueba no es evidencia de rendimiento.

### Caché

- Definir para cada caché: qué se almacena, en qué nivel, con qué clave, ámbito de aislamiento, tiempo de vida, criterio de invalidación y comportamiento ante dato obsoleto.
- Cachear resultados costosos, estables y reutilizables. No cachear datos sensibles, específicos de una sesión o que exijan consistencia inmediata sin un mecanismo de invalidación confiable.
- Incluir en la clave todo lo que cambie el resultado, incluidos tenant, identidad, permisos, versión de contrato e idioma. Una clave incompleta causa fuga de datos entre usuarios.
- Invalidar de forma explícita al mutar el dato de origen. No depender solo de la expiración cuando la frescura sea parte del requisito.
- Proteger contra estampida y avalancha mediante bloqueo de recomputación, expiración distribuida o regeneración en segundo plano.
- Emitir cabeceras de caché y validadores coherentes para respuestas HTTP cacheables por clientes o capas intermedias.
- Medir tasa de aciertos y latencia. Una caché sin métricas no se puede justificar ni ajustar.

### Trabajo asíncrono

- Una operación cuya duración supere el presupuesto de respuesta del endpoint no se ejecuta dentro de la petición. Se acepta, se persiste y se procesa fuera de la ruta crítica.
- Devolver una referencia consultable con estado, progreso, resultado y error. El consumidor debe poder continuar usando la aplicación mientras el proceso avanza.
- Ejecutar el trabajo diferido mediante cola, job o worker con idempotencia, reintentos acotados, backoff, límite de concurrencia y destino para mensajes fallidos.
- No bloquear el bucle de ejecución ni hilos de atención con cómputo intensivo, esperas sincrónicas ni operaciones de archivo grandes.
- Notificar la finalización mediante consulta, evento o notificación, según el contrato acordado con el consumidor.
- Definir qué ocurre si el proceso falla parcialmente: compensación, reintento seguro o estado de error visible y accionable.

### Conexiones y límites de recursos

- Toda fuente de datos se accede mediante un pool configurado con tamaño mínimo, máximo, tiempo de espera de adquisición, tiempo de vida de conexión, validación y comportamiento ante agotamiento.
- Dimensionar el pool según la capacidad real de la base de datos y el número de instancias del servicio. La suma de todos los pools no puede superar el límite de conexiones de la fuente.
- Liberar siempre la conexión, incluso ante error. Mantener transacciones cortas y no ejecutar llamadas externas dentro de una transacción abierta.
- Definir timeouts de consulta, de transacción y de cliente. Una espera sin límite convierte una degradación en caída total.
- Reutilizar clientes HTTP con keep-alive y límites de conexión por destino; no crear un cliente nuevo por petición.
- Aplicar límites de concurrencia, tamaño de payload, profundidad de expansión y presupuesto de tiempo por operación. Ante saturación, aplicar backpressure y degradación controlada en lugar de aceptar trabajo que no se puede completar.
- Declarar la estrategia de escalado horizontal: estado externalizado, ausencia de afinidad de sesión y coordinación de límites entre réplicas.

### Protección ante abuso

- Aplicar límites de tasa y cuotas por identidad, origen, recurso y operación, coordinados entre réplicas cuando la arquitectura sea distribuida.
- Diferenciar límite por consumidor legítimo de bloqueo por abuso, y responder con un código y cabeceras que permitan al cliente reintentar de forma correcta.
- Los detalles de detección, autenticación resistente a fuerza bruta y verificación defensiva se rigen por el estándar de seguridad.

### Observabilidad bajo carga

- Emitir logs estructurados con identificador de correlación propagado por toda la cadena, operación, resultado, duración, dependencia y causa del error. El mensaje debe permitir identificar la causa exacta sin reproducir el incidente.
- Registrar el fallo una sola vez con contexto completo en el punto donde se decide el resultado; no duplicar el mismo error en cada capa.
- Medir por operación: latencia con percentiles, tasa de error, throughput, saturación de pools y colas, duración de trabajos diferidos, aciertos de caché y consumo de dependencias.
- Definir umbrales y alertas sobre degradación, agotamiento de conexiones, crecimiento de cola, aumento de reintentos y errores repetidos.
- Conservar trazas de las operaciones críticas con sus dependencias, respetando redacción de secretos y datos personales.

## 12. Calidad y entrega

Antes de declarar un cambio listo:

1. Ejecutar formato en modo verificación, análisis estático sin autocorrección, build y pruebas aplicables.
2. Probar reglas de dominio y casos de uso con dobles de puertos.
3. Probar adaptadores contra contratos reales o entornos controlados.
4. Cubrir rutas críticas de extremo a extremo, incluidas autorización, idempotencia y fallos de dependencias.
5. Verificar migraciones y metadata desde un entorno limpio cuando cambien datos o permisos.
6. Verificar acceso a datos, caché, trabajo asíncrono, pooling y límites según la sección 11 cuando el cambio los afecte.
7. Ejecutar una prueba de carga con al menos 100 usuarios concurrentes sobre los flujos críticos afectados, en un entorno autorizado y representativo, antes de considerar el cambio listo para producción.
8. Preparar métricas, umbrales de alerta, rollback y migración de datos cuando el cambio afecte producción.
9. Versionar el artefacto desplegado, separar su configuración y comprobar health/readiness, backup y restauración antes de operar datos críticos.
10. Ejecutar la prueba de arquitectura de DTOs (`templates/dto-contract-guard/`) y comprobar que cada endpoint nuevo o modificado acepta y devuelve solo DTOs, con la prueba de claves exactas de su respuesta.

La política universal exige rechazar entradas no permitidas, salvo una excepción de compatibilidad registrada. Si un sistema heredado hoy las descarta silenciosamente, se documenta como desfase y no se replica en cambios nuevos.

La cobertura no sustituye el análisis de riesgo. Los cambios de autenticación, pagos, datos personales, migraciones, efectos externos e IA requieren pruebas adicionales y revisión explícita.

## 13. Decisiones y documentación

- Un cambio que altere límites, contratos, persistencia, seguridad, escalabilidad o despliegue requiere una decisión registrada con contexto, alternativa y consecuencias.
- Mantener el README operativo del servicio y los contratos de integración actualizados.
- Los documentos históricos sirven como evidencia, no como norma cuando contradicen la arquitectura vigente.
- Las reglas locales de framework viven en un adaptador separado para que este estándar pueda reutilizarse en cualquier lenguaje.
