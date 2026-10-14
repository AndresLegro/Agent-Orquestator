# Adaptador backend: NestJS y TypeScript

> Aplicación genérica de `../standards/backend-engineering.md` a servicios NestJS. Los proveedores, convenciones y comandos de un proyecto viven en su perfil.

## Módulos y dependencias

- Organizar por capacidad de negocio y separar `domain`, `application` e `infrastructure`.
- El módulo Nest compone dependencias; los casos de uso dependen de puertos y no de clientes HTTP, SDKs o repositorios concretos.
- Declarar tokens de inyección junto al contrato que representan y enlazarlos explícitamente en el módulo.
- Publicar fachadas o puertos entre módulos; evitar importar servicios internos de otra capacidad.

## Transporte y validación

- Los controllers, consumidores de colas, cron jobs y webhooks son adaptadores de entrada: reciben, validan, autentican y delegan.
- Usar DTOs específicos por operación y `ValidationPipe` global con `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`, salvo una excepción de compatibilidad documentada. La configuración vive en una función compartida entre el arranque y las pruebas de integración, para que ambos ejerciten lo mismo.
- Aplicar guards a endpoints protegidos y verificar autenticidad, replay protection e idempotencia en webhooks antes de sus efectos.
- No devolver excepciones, entidades internas ni detalles del proveedor como contratos públicos.

### DTOs en NestJS (obligatorios, ver estándar sección 6)

- **Entrada:** todo `@Query()`, `@Param()` y `@Body()` se tipa con una clase `*Dto` con `class-validator` y, cuando haya números o fechas, `@Type(() => Number)` de `class-transformer`. Prohibido `@Param('id') id: string`, `@Body() body: { ... }` y `@Query() q: Record<string, string>`: el pipe no puede validar lo que no tiene clase.
- **Paginación:** una sola clase compartida (`PaginationQueryDto`) con cota máxima de `pageSize` y valores por defecto en los inicializadores de propiedad; los controllers no repiten `?? 1` ni `?? 25`.
- **Salida:** todo handler declara su tipo de retorno (`Promise<ApiResponseDto<...Dto>>`). El DTO de salida expone un `static fromEntity()` que copia campo por campo; nunca `...entity`, `Object.assign`, un cast ni devolver la fila del driver.
- **Envoltorio:** `ApiResponseDto<T>`, `PageDto<T>`, `ItemsDto<T>` y `CountDto` compartidos (`{ result, message, response }`); los controllers usan `ApiResponseDto.ok(...)`, no objetos literales.
- **Nulos:** el DTO de salida declara `T | null` y conserva el `null`; no lo convierte en `0` ni `''`. Al validar filas de una fuente con `zod`, `z.coerce.number()` convierte `null` en `0`: se usa `.nullable()` sobre el coerce.
- **Controllers sin entidades:** un controller no importa de `domain/entities`; si lo necesita, el mapeo pertenece al DTO de salida.
- **Verificación automática:** copiar `templates/dto-contract-guard/` al proyecto (`src/testing/dto-rules.ts` y `src/architecture/dto-contract.spec.ts`). Recorre todos los `*.controller.ts` y falla si un parámetro de entrada no es `*Dto`, si un handler no declara un retorno `*Dto` o si el controller importa entidades. Excluir `src/testing` del build (`tsconfig.build.json`). La prueba se ejecuta con el resto de la suite, de modo que un endpoint nuevo queda cubierto sin registrarlo en ningún sitio.
- **Prueba por endpoint:** además de la guardia, cada integración verifica las claves exactas de la respuesta y que un campo extra de la entidad (inyectado en el doble del repositorio) no aparece en la salida.

## Configuración e infraestructura

- Cargar configuración por `ConfigService` o un puerto equivalente y validar variables obligatorias al inicio.
- Aislar clientes de base de datos, mensajería, CRM y APIs externas en adaptadores de infraestructura.
- Traducir errores externos a errores de aplicación consistentes y registrar causa técnica de manera segura.
- Mantener secretos fuera del código, DTOs, respuestas y logs.

## Escalabilidad

- Configurar el pool del cliente de base de datos u ORM con tamaño máximo, timeout de adquisición, tiempo de vida y validación; dimensionarlo considerando el número de instancias del servicio.
- Revisar las consultas generadas por el ORM o query builder, incluidas relaciones cargadas, para evitar N+1, lecturas sin límite y proyecciones excesivas.
- Encapsular la caché detrás de un puerto o del módulo de caché del framework, con clave, TTL e invalidación explícitas por operación.
- Ejecutar trabajo prolongado en una cola o worker con reintentos acotados, límite de concurrencia y destino para mensajes fallidos; no bloquear el event loop con cómputo intensivo ni esperas sincrónicas.
- Aplicar límites de tasa y de tamaño de payload en los adaptadores de entrada, coordinados entre réplicas cuando haya varias instancias.
- Emitir logs estructurados con identificador de correlación propagado e instrumentar latencia, errores y saturación mediante interceptores o middleware comunes.

## Calidad

- Usar TypeScript estricto y evitar `any` en fronteras o contratos de aplicación.
- Probar casos de uso con dobles de puertos, adaptadores con contratos reales o controlados y rutas críticas de extremo a extremo.
- Ejecutar formato en modo check, análisis estático sin `--fix`, build y pruebas desde el directorio del servicio.
- Las pruebas de integración de controllers usan `Test.createTestingModule(...).overrideProvider(TOKEN).useValue(doble)` sobre el puerto de datos; no se mantiene un adaptador "de datos de ejemplo" dentro del código de producción.

Los perfiles pueden declarar estructuras de archivo, DTOs, librerías de validación, formatos de respuesta y comandos propios, siempre que mantengan estos límites.
