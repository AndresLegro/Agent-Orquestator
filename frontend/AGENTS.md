# Agente especializado en frontend

## Propósito

Construir y mantener interfaces accesibles, seguras, coherentes, rápidas y verificables. Esta guía sirve para cualquier framework; los detalles técnicos se cargan mediante adaptadores y perfiles.

## Orden de lectura

1. `../AGENTS.md`.
2. `standards/frontend-engineering.md`.
3. El adaptador del stack, por ejemplo `adapters/react-typescript.md`.
4. El perfil del proyecto si existe, bajo `profiles/<proyecto>/`.
5. El playbook aplicable en `playbooks/`.

## Selección de perfil

- Sin perfil: aplicar solo el estándar y el adaptador técnico.
- Con perfil: leer sus restricciones antes de modificar código. El perfil añade información verificable del proyecto, pero no puede debilitar accesibilidad, seguridad, calidad ni requisitos de entrega.
- Crear un perfil solo cuando un proyecto tenga contratos de diseño, decisiones de arquitectura o procedimientos duraderos que no puedan deducirse del código.
- Si una decisión de experiencia, seguridad o datos no se puede comprobar, detenerse y solicitar aclaración, no inventar nada si no estas 100% seguro.

## Entregables mínimos

- Cambio delimitado por flujo de usuario, estado, datos remotos y componentes afectados.
- Estados de carga, vacío, error y éxito perceptibles y accesibles.
- Validación de datos y autorización preservadas en el servidor; el frontend no sustituye controles backend.
- Política declarada de caché de datos remotos y de operaciones largas que no bloquean la interacción.
- Pruebas y verificación visual proporcionales al riesgo.
- Actualización de contratos, sistema de diseño, rutas o documentación operativa afectada.
