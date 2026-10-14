# Playbook: verificación de integración

Usar este procedimiento para verificar una capacidad nueva, corrección crítica, cambio de contrato, migración, integración externa o flujo de extremo a extremo.

## 1. Diseñar la evidencia

- Identificar criterio de aceptación, invariantes, consumidores, productores, persistencia y efectos salientes.
- Definir qué regresión concreta debe detectar cada prueba y cuál será su oráculo.
- Enumerar casos nominales, inválidos, duplicados, reintentos, autorización negativa, concurrencia y fallos de dependencia relevantes.
- Clasificar riesgo e indicar qué debe ejecutarse por cambio, de forma programada o antes de producción.

## 2. Preparar el entorno

- Crear un entorno efímero con versiones reales o protocolariamente equivalentes de las dependencias críticas.
- Aplicar migraciones, permisos, metadata y semillas desde cero.
- Configurar receptores controlados para efectos externos y capturar sus interacciones.
- Generar datos mínimos por prueba y confirmar limpieza, aislamiento y trazabilidad.

## 3. Ejecutar pruebas

- Invocar el sistema por su frontera pública: HTTP, evento, cola, CLI o interfaz de navegador.
- Verificar respuesta, estado persistido, transiciones, auditoría y efectos emitidos.
- Repetir operaciones mutativas para demostrar idempotencia o rechazo correcto de duplicados.
- Introducir fallos controlados y validar timeout, reintento, compensación, recuperación y mensajes seguros.
- Para flujos de interfaz, recorrer el caso de usuario en navegador real y comprobar el resultado final en la persistencia.

## 4. Verificar bajo concurrencia

- Ejecutar los recorridos críticos con al menos 100 usuarios concurrentes en un entorno autorizado, con datos de volumen representativo.
- Declarar antes de ejecutar el perfil de carga, la duración, los umbrales de latencia y error, y el criterio de parada.
- Comprobar correctitud bajo concurrencia: sin datos cruzados entre usuarios, duplicados, pérdidas de escritura ni invariantes rotas.
- Observar saturación de pool de conexiones, colas, memoria y dependencias; tasa de aciertos de caché; y aplicación correcta de límites de tasa.
- Confirmar que los logs, métricas y trazas permiten diagnosticar cada fallo observado sin reproducirlo manualmente.
- Registrar cuellos de botella, versión probada, configuración y riesgo residual.

## 5. Evaluar resultados

- Registrar evidencia de cada oráculo: IDs, consultas, payloads capturados, trazas y capturas relevantes.
- Clasificar cualquier desviación como defecto de producto, defecto de prueba, inestabilidad de entorno o requisito ambiguo.
- No cerrar un hallazgo por hacer la aserción menos estricta, ampliar un timeout o añadir un mock que imite la implementación.
- Convertir defectos relevantes en prueba de regresión con causa raíz documentada.

## 6. Entrega

- Ejecutar formato, análisis estático, build, unitarias, integración, carga y E2E según el riesgo.
- Publicar el alcance cubierto, riesgos no cubiertos, entorno usado y resultados.
- Actualizar contratos, datos de prueba, runbooks y ADRs afectados.
