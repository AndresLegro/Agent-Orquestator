# Estándar de ingeniería de calidad

> Principios canónicos para QA y verificación, independientes de lenguaje, framework y producto.
>
> Complementa los adaptadores en `../adapters/` y los perfiles de proyecto en `../profiles/`.

## 1. Objetivo

La calidad se demuestra mediante evidencia de comportamiento observable, no por cantidad de pruebas ni por una consola en verde. Una prueba es valiosa si falla cuando se rompe una propiedad importante y explica cuál es el desvío.

Cada prueba debe declarar un oráculo verificable: estado persistido, contrato, efecto emitido, respuesta, transición, métrica o experiencia observable. Una aserción trivial, un mock que replica la implementación o una prueba que no puede fallar ante una regresión no cuentan como cobertura efectiva.

## 2. Estrategia basada en riesgo

- Partir de criterios de aceptación, invariantes, fronteras de confianza, efectos externos, concurrencia y recuperación ante fallos.
- Priorizar autenticación, autorización, datos, dinero, privacidad, migraciones, integración, idempotencia, seguridad y flujos de mayor impacto.
- Mantener una matriz que relacione riesgo, comportamiento esperado, tipo de prueba, entorno y evidencia.
- Añadir pruebas de regresión que reproduzcan la causa raíz de defectos relevantes; no solo el síntoma visible.
- Usar pruebas unitarias para reglas puras y decisiones complejas, pero no como sustituto de pruebas de integración.

## 3. Pruebas de integración como evidencia principal

- Probar módulos mediante sus puertos públicos con procesos, bases de datos, colas, almacenamiento y protocolos reales en un entorno aislado y controlado.
- Levantar el esquema desde cero aplicando migraciones, permisos, metadata y semillas necesarios. Verificar repetibilidad y limpieza entre ejecuciones.
- Validar lecturas y escrituras directamente contra la persistencia, no solo contra objetos devueltos en memoria.
- Validar solicitudes, respuestas, cabeceras, códigos, esquemas y compatibilidad de cada contrato HTTP, evento, archivo o mensaje.
- Capturar efectos salientes con receptores de prueba que implementen el protocolo real; verificar contenido, orden, idempotencia y ausencia de duplicados.
- Probar reintentos, duplicados, carreras, reinicios, timeouts, errores transitorios y eventos desordenados cuando el flujo los pueda experimentar.

## 4. Uso responsable de mocks

- No usar mocks para sustituir la unidad bajo prueba, la persistencia crítica, el contrato de integración ni el efecto que se pretende validar.
- Usar dobles solo para aislar una dependencia no determinista, costosa, peligrosa o no disponible en un entorno de prueba.
- Todo doble debe reproducir el contrato relevante, registrar interacciones y tener al menos una prueba de contrato contra una implementación real o un sandbox controlado.
- Nunca afirmar que una integración funciona porque un mock devolvió el valor esperado.

## 5. Datos y entornos de prueba

- Crear entornos efímeros, aislados y reproducibles; no reutilizar datos compartidos o de producción.
- Usar migraciones y semillas versionadas. Las pruebas deben poder recrear su estado sin intervención manual.
- Generar datos mínimos, explícitos y trazables por prueba; limpiar o descartar el entorno al terminar.
- Enmascarar datos sensibles y prohibir credenciales, datos personales reales o secretos en fixtures, snapshots, reportes y logs.
- Mantener configuración de prueba separada de producción y fallar temprano si faltan dependencias o variables obligatorias.

## 6. Contratos, flujos y experiencia

- Versionar contratos y probar entradas válidas, inválidas, límites, compatibilidad y autorización negativa.
- Para cada endpoint de un backend, comprobar que acepta y devuelve solo DTOs: la prueba de arquitectura de DTOs del proyecto (`backend/templates/dto-contract-guard/`) debe existir y pasar, y la prueba de integración del endpoint debe verificar las claves exactas de la respuesta y que un campo extra de la entidad no se filtra. Un endpoint sin DTOs es un defecto de seguridad, no de estilo.
- Para una operación mutativa, verificar precondición, efecto persistido, efecto saliente, respuesta al consumidor e idempotencia.
- Para interfaces, ejecutar los flujos críticos en un navegador real contra el stack de integración y comprobar interacción, navegación, accesibilidad y estado final persistido.
- Usar esperas por condición, identificadores de correlación y observabilidad; no pausas fijas.
- Validar recuperación tras recarga, reintento, sesión expirada o indisponibilidad de dependencia cuando corresponda.

## 7. Pirámide de evidencia

1. **Reglas puras:** pruebas unitarias rápidas para invariantes y transformaciones.
2. **Módulos integrados:** casos de uso con adaptadores, almacenamiento y protocolos reales controlados.
3. **Contratos:** compatibilidad entre productor y consumidor en cada frontera.
4. **Extremo a extremo:** recorridos críticos a través de procesos reales y navegador cuando aplica.
5. **Resiliencia:** concurrencia, reinicios, fallos transitorios, carga y seguridad programados según riesgo.

La prioridad no es reducir el número de capas, sino elegir la evidencia más cercana al fallo que se quiere prevenir.

## 8. Pruebas de carga y escalabilidad

Una funcionalidad no está verificada si solo se probó con un usuario. Los flujos críticos requieren evidencia de comportamiento bajo concurrencia antes de llegar a producción.

### Alcance mínimo

- Simular al menos **100 usuarios concurrentes** sobre los recorridos críticos afectados: autenticación, lecturas de alto tráfico, operaciones mutativas, búsquedas y procesos costosos.
- Ejecutar sobre un entorno autorizado, aislado y representativo en datos, configuración, réplicas y límites. Un entorno con volumen mínimo no produce evidencia válida.
- Definir antes de ejecutar: objetivo, perfil de carga, duración, datos, criterios de aceptación, criterio de parada y responsable.
- Incluir escenarios de carga sostenida, crecimiento progresivo y pico corto. Cuando aplique, verificar el retorno a estado normal después del pico.

### Qué debe verificarse

- Correctitud bajo concurrencia: ausencia de respuestas erróneas, datos cruzados entre usuarios, duplicados, pérdidas de escritura o violaciones de invariantes.
- Latencia por percentiles y tasa de error frente a los umbrales acordados, no solo el promedio.
- Saturación de recursos: pool de conexiones, colas, memoria, CPU y dependencias externas.
- Comportamiento de caché bajo carga: tasa de aciertos, estampida, datos obsoletos y aislamiento por identidad.
- Procesos asíncronos: tiempo de encolado, throughput de procesamiento, crecimiento de la cola, reintentos y mensajes fallidos.
- Límites de tasa y cuotas: que se apliquen, que respondan de forma correcta y que no degraden a usuarios legítimos.
- Diagnóstico: que los logs, métricas y trazas generados permitan identificar la causa exacta de cada fallo observado sin reproducirlo manualmente.

### Reglas de validez

- Una prueba de carga que no falla nunca, no mide saturación ni tiene umbrales declarados, no es evidencia.
- No ejecutar contra producción compartida ni infraestructura de terceros sin autorización explícita y límites acordados.
- Registrar resultados, configuración, versión probada, cuellos de botella detectados y riesgo residual.
- Repetir la prueba cuando cambien el modelo de datos, el acceso a datos, la estrategia de caché, el procesamiento asíncrono o la topología de despliegue.

## 9. Ejecución y calidad de las pruebas

- Las pruebas deben ser independientes, deterministas y capaces de ejecutarse en paralelo cuando el entorno lo permita.
- No ocultar fallos con reintentos ciegos, exclusiones permanentes, esperas arbitrarias o aserciones relajadas.
- Distinguir defecto de producto, defecto de prueba, inestabilidad de entorno y requisito ambiguo.
- Publicar reportes con comportamiento observado, esperado, evidencia, alcance y riesgo residual.
- Ejecutar en cada cambio las pruebas proporcionales al riesgo; ejecutar resiliencia, carga, seguridad, matriz de compatibilidad y E2E completo de forma programada o previa a una entrega crítica.

## 10. Decisiones y documentación

- Registrar un ADR cuando cambie la estrategia de pruebas, el entorno de integración, la política de datos, la compatibilidad de contratos, el perfil de carga o la puerta de calidad.
- Mantener documentación de entornos, semillas, contratos, criterios de aceptación y procedimientos de reproducción.
- Los perfiles de proyecto solo contienen hechos técnicos comprobables; no lógica de negocio ni ejemplos de clientes.
