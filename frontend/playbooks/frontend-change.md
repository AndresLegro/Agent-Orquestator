# Playbook: cambio frontend

Usar este procedimiento para una capacidad nueva, cambio de flujo, componente compartido, ruta, integración remota o modificación del sistema de diseño.

## 1. Descubrimiento

- Leer `AGENTS.md`, el estándar frontend, el adaptador técnico, el perfil del proyecto y las instrucciones locales.
- Identificar personas usuarias, flujo, rutas, componentes, estado, contratos remotos, permisos y estados asíncronos afectados.
- Confirmar criterios de aceptación con evidencia de código, diseño, contrato o documentación vigente.
- Detenerse y pedir aclaración si una decisión de experiencia, accesibilidad, seguridad o datos no es verificable.

## 2. Diseño mínimo

- Delimitar qué pertenece a presentación, flujo de interfaz, datos e infraestructura de plataforma.
- Definir estados de carga, vacío, error, éxito, reintento y confirmación necesarios.
- Definir clave, frescura, invalidación y deduplicación de cada lectura remota, y cómo se actualiza tras una mutación.
- Decidir qué operaciones son largas y cómo se ejecutan sin bloquear la interacción ni el hilo de interfaz.
- Diseñar semántica, foco, teclado, mensajes y responsive antes de implementar componentes interactivos.
- Identificar compatibilidad o migración si cambian una ruta, contrato de API, configuración, token de diseño o estado persistido.
- Registrar un ADR si cambia arquitectura de estado, routing, sistema de diseño, seguridad o entrega.

## 3. Implementación

- Componer páginas con componentes y hooks cohesionados; no colocar solicitudes HTTP ni lógica de datos remotos en presentación.
- Reutilizar el cliente remoto, tokens de diseño y primitives existentes antes de crear variantes nuevas.
- Tipar entradas, salidas, eventos y datos remotos; validar límites externos cuando el entorno lo permita.
- Implementar estados accesibles y prevenir acciones duplicadas o inválidas.
- Mantener autorización, validación de negocio y secretos fuera del cliente.

## 4. Pruebas y verificación visual

- Añadir o actualizar pruebas para flujos, componentes y transformaciones de datos modificadas.
- Probar navegación, permisos visibles, errores, reintentos y acciones críticas.
- Verificar con teclado, foco, lector de pantalla y tamaños de viewport relevantes.
- Ejecutar la aplicación en un navegador real y revisar la interfaz afectada antes de declarar el cambio terminado.
- Medir rendimiento si cambian rutas críticas, dependencias, imágenes, renderizados o carga de datos.
- Probar con volumen de datos representativo y verificar caché, invalidación tras mutación y ausencia de solicitudes duplicadas.
- Comprobar que la interfaz permanece navegable durante operaciones largas y que responde de forma correcta ante límites de tasa y latencia alta del backend.

## 5. Entrega

- Ejecutar formato en modo check, lint, type-check, build y pruebas aplicables.
- Revisar dependencias, secretos en el bundle, configuración pública y artefactos de producción.
- Actualizar contratos, catálogo de componentes, decisiones y runbooks afectados.
- Informar archivos modificados, comandos ejecutados, resultados y validaciones pendientes de entornos externos.
