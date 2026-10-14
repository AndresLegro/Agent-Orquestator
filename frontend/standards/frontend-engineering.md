# Estándar de ingeniería frontend

> Principios canónicos para interfaces web y aplicaciones cliente, independientes de framework.
>
> Complementa los adaptadores en `../adapters/` y los perfiles de proyecto en `../profiles/`.

## 1. Resultado esperado

Una interfaz debe permitir que las personas completen una tarea de forma comprensible, accesible, segura y eficiente. El código se organiza por capacidad de producto y responsabilidades, no por conveniencia de librerías o páginas aisladas.

## 2. Límites de arquitectura

Separar las responsabilidades siguientes:

- **Presentación:** componentes, layout, estilos, interacción y semántica accesible.
- **Flujos de interfaz:** hooks, controladores o casos de uso que coordinan estado de pantalla, validación, navegación y operaciones.
- **Datos e integración:** clientes HTTP, caché, mappers, validación de respuestas y contratos remotos.
- **Plataforma:** proveedores globales, rutas, internacionalización, tema, telemetría y configuración.

Las páginas componen flujos y componentes. Los componentes compartidos no conocen reglas de una capacidad concreta. Los servicios de datos no deciden presentación ni mutan estado visual directamente.

## 3. Organización y estado

- Agrupar cada capacidad por páginas, componentes, hooks o flujos, servicios, tipos, mappers y constantes cuando sean necesarios.
- Mantener componentes, layout y utilidades compartidas fuera de las capacidades de producto.
- Mantener estado efímero cerca del componente o flujo que lo usa.
- Usar estado global solo para información transversal y estable; dividirlo por dominios para evitar acoplamiento y renderizados innecesarios.
- Separar estado de servidor del estado de interfaz. El primero debe tener estrategia de caché, invalidación, error y reintento explícita.
- Derivar valores durante el renderizado cuando sea posible; no sincronizar estado redundante mediante efectos.

## 4. Datos, contratos y seguridad

- Centralizar el acceso remoto en un cliente con URL configurable, timeout, credenciales necesarias, errores normalizados y telemetría segura.
- Tipar y validar datos de entrada y respuestas remotas antes de que alcancen la interfaz.
- Adaptar contratos remotos a modelos de interfaz mediante mappers; no propagar detalles del transporte a componentes.
- El frontend puede ocultar o deshabilitar una acción por experiencia, pero la autorización y validación de negocio siempre pertenecen al servidor.
- No guardar secretos ni tokens de larga duración accesibles a JavaScript. Aplicar CSP, TLS, políticas de origen y protección frente a XSS/CSRF desde el borde y el backend.
- No registrar datos personales, credenciales ni payloads completos en consola, analítica o telemetría.

## 5. Diseño y accesibilidad

- Centralizar tokens de color, tipografía, espaciado, elevación, breakpoints, estados y movimiento en un sistema de diseño.
- Preferir elementos nativos o componentes que preserven semántica, foco y teclado. Todo control interactivo debe ser operable sin ratón.
- Proveer nombre accesible a controles con iconos, etiquetas visibles o programáticas para campos y asociaciones correctas en diálogos.
- Anunciar carga, errores, confirmaciones y cambios relevantes a tecnologías asistivas; gestionar foco en diálogos y navegación.
- Respetar contraste, zoom, preferencias de movimiento reducido y dispositivos de diferentes tamaños.
- Internacionalizar textos visibles, formatos y mensajes; no depender de texto hardcodeado para lógica de aplicación.

## 6. Resiliencia y experiencia

- Cada operación asíncrona declara estados de carga, vacío, error, éxito y recuperación cuando aplique.
- Deshabilitar o proteger acciones inválidas, duplicadas o todavía en curso.
- Solicitar confirmación para acciones destructivas o de impacto y explicar consecuencias antes de ejecutarlas.
- Preservar datos de formulario de forma proporcional al riesgo y no perder entradas por errores recuperables.
- Diseñar rutas, estados de navegación y enlaces profundos para que la interfaz sea recuperable tras recarga o regreso.

## 7. Rendimiento y escalabilidad

- Medir antes de optimizar y establecer presupuestos de tamaño, carga, interacción y renderizado para rutas críticas.
- Cargar de forma diferida rutas, módulos pesados y recursos no esenciales.
- Evitar renders, efectos, solicitudes y suscripciones innecesarias; cancelar o ignorar resultados obsoletos.
- Optimizar imágenes, fuentes y recursos estáticos según evidencia de uso real.
- Recopilar métricas de experiencia sin incluir información personal innecesaria.

### Caché de datos remotos

- Toda lectura remota declara clave, ámbito, tiempo de frescura, política de revalidación, invalidación tras mutación y comportamiento ante error.
- Incluir en la clave identidad, permisos, idioma, filtros y paginación. Una clave incompleta muestra datos de otro usuario o de otro contexto.
- Reutilizar datos ya obtenidos en lugar de repetir la misma solicitud entre componentes, pantallas o montajes sucesivos.
- Deduplicar solicitudes concurrentes hacia el mismo recurso y cancelar las que quedan obsoletas por navegación o cambio de filtros.
- Invalidar o actualizar la caché tras una mutación exitosa; no dejar la interfaz mostrando un estado anterior al cambio.
- Limpiar datos cacheados de usuario al cerrar sesión o cambiar de contexto.
- Aplicar prefetch solo en navegaciones probables y medibles, sin degradar la carga inicial.

### Trabajo que no bloquea al usuario

- Ninguna operación larga bloquea el hilo de interfaz. La aplicación permanece navegable, cancelable y responsiva mientras el proceso avanza.
- Para procesos prolongados en servidor, iniciar la operación, mostrar estado consultable y permitir que el usuario continúe en otra tarea; notificar el resultado al finalizar.
- Mover cómputo intensivo del cliente fuera del hilo principal cuando afecte la respuesta a la interacción.
- Virtualizar listas extensas y diferir renderizado de contenido no visible.
- Agrupar o limitar la frecuencia de eventos de alta cadencia como escritura, desplazamiento, redimensionado y actualizaciones en vivo.
- Mostrar progreso real cuando exista y estados intermedios comprensibles cuando no lo haya.

### Verificación bajo carga

- Validar las rutas críticas con volúmenes de datos representativos, no con conjuntos mínimos de ejemplo.
- Comprobar el comportamiento de la interfaz mientras el backend opera bajo la prueba de carga acordada con QA, verificando latencia percibida, errores, reintentos y respuesta ante límites de tasa.

## 8. Calidad y entrega

Antes de declarar un cambio listo:

1. Ejecutar formato en modo verificación, análisis estático, type-check, build y pruebas aplicables.
2. Probar componentes, flujos y contratos de datos según el riesgo.
3. Validar navegación, permisos visibles, estados asíncronos y comportamiento en tamaños relevantes.
4. Ejecutar revisión de accesibilidad automatizada y verificación manual de teclado, foco y lector de pantalla en cambios interactivos.
5. Comprobar presupuestos de rendimiento, dependencias, secretos y artefactos de producción cuando aplique.
6. Verificar caché, invalidación tras mutación, deduplicación de solicitudes y ausencia de bloqueo de la interfaz en operaciones largas, con datos de volumen representativo.
7. Documentar cambios duraderos de rutas, contratos, sistema de diseño o entrega.

Las capturas visuales no sustituyen pruebas de interacción, accesibilidad ni verificación en un navegador real.

## 9. Decisiones y documentación

- Registrar una decisión cuando cambie la arquitectura de estado, rutas, datos, sistema de diseño, seguridad o entrega.
- Mantener contratos de API, guías de componentes y procedimientos de despliegue coherentes con la implementación.
- Los perfiles de proyecto contienen solo decisiones verificables que no sean universales ni deducibles del repositorio actual.
