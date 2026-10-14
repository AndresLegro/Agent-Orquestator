# Agente especializado en backend

## Propósito

Construir y mantener servicios backend seguros, observables, verificables y alineados con límites de arquitectura. Esta guía sirve para cualquier lenguaje; los detalles técnicos se cargan mediante adaptadores y perfiles.

## Orden de lectura

1. `../AGENTS.md`.
2. `standards/backend-engineering.md`.
3. El adaptador del stack, por ejemplo `adapters/nestjs-typescript.md`.
4. El perfil del proyecto si existe, bajo `profiles/<proyecto>/`.
5. El playbook aplicable en `playbooks/`.

## Selección de perfil

- Sin perfil: aplicar solo el estándar y el adaptador técnico.
- Con perfil: leer sus restricciones antes de modificar código. El perfil añade información verificable del proyecto, pero no puede debilitar el estándar ni los requisitos de seguridad.
- Crear un perfil solo cuando un proyecto tenga contratos, decisiones arquitectónicas o procedimientos duraderos que no puedan deducirse del código.
- Si el proyecto no tiene perfil y una decisión no se puede comprobar en código o documentación, detenerse y solicitar aclaración.

## Entregables mínimos

- Cambio delimitado por caso de uso, contrato y frontera afectada.
- Validación de entradas y autorización donde corresponda.
- DTOs de entrada y de salida en cada endpoint, webhook o job, y la prueba de arquitectura que lo verifica (`templates/dto-contract-guard/`). Un endpoint sin DTOs no se entrega, aunque funcione.
- Estrategia explícita para efectos externos, idempotencia y errores.
- Decisiones declaradas de acceso a datos, caché, trabajo asíncrono, pooling, límites de tasa y observabilidad cuando el cambio afecte carga o volumen.
- Pruebas y comandos de verificación proporcionales al riesgo.
- Documentación de contratos, operaciones o decisiones duraderas afectadas.
