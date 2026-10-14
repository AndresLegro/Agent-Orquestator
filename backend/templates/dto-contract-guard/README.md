# Plantilla: guardia de contrato DTO

Prueba de arquitectura que hace **imposible olvidar los DTOs** en un backend NestJS. Recorre todos los `*.controller.ts` del proyecto y falla si:

1. Un parámetro `@Body()`, `@Query()` o `@Param()` no está tipado con una clase `*Dto` (primitivos, tipos literales en línea y `Record<...>` fallan).
2. Un handler HTTP no declara su tipo de retorno, o este no menciona una clase `*Dto`.
3. El controller importa entidades de dominio (`/domain/entities/`), que es la forma habitual de acabar devolviendo la entidad sin mapear.

Además comprueba que el `ValidationPipe` global de `app.setup.ts` usa `whitelist`, `forbidNonWhitelisted` y `transform`.

La regla y su justificación están en `../../standards/backend-engineering.md` (sección 6, "DTOs obligatorios") y en `../../adapters/nestjs-typescript.md`.

## Instalación

1. Copiar `dto-rules.ts` a `src/testing/dto-rules.ts` y `dto-contract.spec.ts` a `src/architecture/dto-contract.spec.ts`.
2. Dependencia: `typescript` (devDependency, ya presente en cualquier proyecto Nest).
3. Excluir `src/testing` del build: en `tsconfig.build.json`, `"exclude": ["node_modules", "dist", "**/*.spec.ts", "src/testing"]`.
4. Ajustes de proyecto, si difieren de los supuestos:
   - Sufijo de los controllers (`.controller.ts`) y de los DTOs (`Dto`) en `dto-contract.spec.ts` y `dto-rules.ts`.
   - Ruta del archivo que configura el `ValidationPipe` (`app.setup.ts`).
   - Patrón de la carpeta de entidades (`/domain/entities/`) si el proyecto usa otra estructura.
5. Ejecutar `npm test`: la guardia corre con el resto de la suite.

## Qué no hace

- No valida que los DTOs de entrada tengan decoradores de `class-validator` ni que los de salida copien campo por campo: eso lo cubren la revisión y la prueba de integración de cada endpoint (claves exactas de la respuesta y un campo extra de la entidad que no se filtra).
- Inspecciona el texto del tipo de retorno: un tipo que contenga la palabra `Dto` pasa aunque envuelva una entidad. Por eso la regla 3 (sin importar entidades en el controller) forma parte de la guardia.
- No cubre consumidores de colas, webhooks o jobs que no sean controllers; si el proyecto los usa, extender `dto-rules.ts` con sus decoradores.

## Cómo se verifica que la guardia funciona

`dto-contract.spec.ts` incluye casos que construyen controllers incorrectos en memoria (sin retorno tipado, retorno que no es DTO, `@Param('id') id: string`, `@Body()` con tipo literal, `@Query()` como `Record`, import de entidad) y esperan la violación correspondiente. Si esos casos dejan de fallar, la regla se rompió.
