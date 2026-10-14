# Estándar de seguridad de aplicaciones

> Estándar defensivo, independiente de lenguaje y framework.
>
> Complementa los adaptadores en `../adapters/` y los perfiles de proyecto en `../profiles/`.

## 1. Baseline obligatorio y trazabilidad

Todo producto debe mantener una matriz de seguridad versionada que relacione riesgo, requisito, control, prueba, evidencia, responsable y frecuencia de verificación.

Usar como baseline:

- **OWASP ASVS** para requisitos verificables de aplicación.
- **OWASP Top 10** para priorizar riesgos web.
- **OWASP API Security Top 10** para fronteras programáticas.
- **OWASP Web Security Testing Guide** para metodología de verificación.
- **CWE** para clasificar debilidades de implementación.
- **NIST SSDF** para prácticas de desarrollo y cadena de suministro.
- **NIST AI RMF** cuando el producto incluya IA, automatización o herramientas capaces de producir efectos.

No todos los requisitos aplican a todos los productos. Cada exclusión debe estar justificada, revisada y registrada; no se omite un control por falta de tiempo.

## 2. Identidad, sesiones y autorización

- Denegar por defecto. Cada ruta, operación, evento y dato debe declarar cómo se autentica y autoriza.
- Validar emisor, audiencia, algoritmo, firma, expiración, revocación y rotación de credenciales según el mecanismo usado.
- Aplicar autorización del lado servidor a cada recurso y operación; no confiar en roles, IDs, scopes o campos enviados por el cliente.
- Evitar enumeración de cuentas y recursos mediante mensajes, tiempos y códigos de respuesta uniformes cuando corresponda.
- Proteger sesiones con cookies seguras o mecanismos equivalentes, caducidad, rotación, revocación y defensas CSRF apropiadas.
- Probar acceso no autenticado, credenciales inválidas, permisos insuficientes, acceso entre ámbitos y sesión expirada.

## 3. Entradas, inyección y XSS

- Tratar toda entrada, archivo, parámetro, cabecera, evento, configuración editable y respuesta externa como no confiable.
- Validar tipo, longitud, formato, rango, enumeración y estructura en la frontera; rechazar propiedades no permitidas salvo una compatibilidad registrada.
- Usar consultas parametrizadas, APIs de acceso a datos seguras o mecanismos equivalentes. Nunca construir sentencias o filtros ejecutables mediante concatenación de entrada.
- Mantener separación de datos y código en plantillas, expresiones, comandos, rutas, consultas y serializadores.
- Codificar la salida según contexto HTML, atributo, URL, JavaScript o CSS; no renderizar HTML no confiable sin saneamiento basado en una política explícita.
- Aplicar CSP, cabeceras de seguridad y políticas de contenido adecuadas en el borde.
- Probar SQL injection y XSS con un corpus interno aprobado de marcadores de prueba inocuos, verificando rechazo, parametrización, codificación contextual y ausencia de ejecución en navegador controlado. No usar ejemplos de payload ofensivo en documentación ni pruebas compartidas.

## 4. Abuso, fuerza bruta y resiliencia

- Aplicar límites por identidad, origen, recurso y operación; combinar rate limiting, cuotas, límites de concurrencia, tamaño, tiempo y presupuesto de coste.
- Diseñar mecanismos de autenticación resistentes a fuerza bruta: respuestas genéricas, detección de intentos, backoff progresivo, MFA cuando el riesgo lo justifique y bloqueo temporal que no permita denegación de cuenta por terceros.
- Proteger recursos costosos con paginación, límites de expansión, timeouts, colas, backpressure, circuit breakers y degradación controlada.
- Validar que los límites persistan o se coordinen entre réplicas cuando la arquitectura sea distribuida.
- Probar abuso mediante secuencias pequeñas, deterministas y autorizadas contra un entorno aislado; comprobar umbrales, respuesta segura, auditoría y recuperación.
- Verificar que los controles de tasa, cuota y concurrencia sigan siendo correctos bajo la prueba de carga concurrente definida con QA, incluida la ausencia de degradación para usuarios legítimos y la coordinación de límites entre réplicas.
- Comprobar que el agotamiento de conexiones, colas o dependencias produzca degradación controlada y auditable, no una caída total ni una respuesta con detalle interno.
- Las pruebas de carga solo se ejecutan con presupuesto, duración, objetivo, criterio de parada y responsable definidos. No se hacen pruebas DDoS volumétricas ni contra producción compartida.

## 5. Datos, secretos y privacidad

- Clasificar datos, minimizar su recolección, definir retención y borrado seguro.
- Cifrar secretos y datos sensibles en tránsito y en reposo con mecanismos autenticados, claves separadas, rotación y mínimo privilegio.
- Prohibir secretos, credenciales, datos personales reales y claves privadas en código, fixtures, logs, capturas, tickets y artefactos de build.
- Validar configuración obligatoria al inicio y fallar de forma segura si falta un secreto o un control crítico.
- Usar permisos de base de datos y almacenamiento restringidos al mínimo necesario; verificar integridad, unicidad e idempotencia en persistencia.

## 6. APIs, eventos e integraciones

- Versionar y validar contratos, tamaños de petición, tipos de contenido, cabeceras y respuestas de error.
- Verificar autenticidad, frescura, integridad e idempotencia de webhooks, eventos y callbacks antes de efectos mutativos.
- Aplicar timeouts, reintentos acotados, validación de certificados y listas de destinos permitidos para llamadas salientes.
- Separar credenciales y privilegios por integración; nunca reutilizar credenciales administrativas en flujos de usuario.
- Probar duplicados, replay, orden invertido, timeout, respuesta inválida y revocación de credenciales en entornos controlados.

## 7. IA y automatización

- El modelo, sus entradas y las salidas de herramientas son datos no confiables. No autorizan operaciones por sí mismos.
- Aplicar allowlists de herramientas, esquemas estrictos, mínimo privilegio, límites de tiempo/coste/iteraciones y comprobaciones de estado antes de mutaciones.
- Requerir confirmación o aprobación separada para operaciones de alto impacto.
- Proteger contra prompt injection, fuga de datos y acciones inducidas mediante separación de instrucciones, datos y capacidades.
- Registrar decisiones y efectos de forma trazable sin exponer información sensible.

## 8. Observabilidad, dependencias y entrega

- Registrar autenticación, autorización, cambios administrativos, controles de abuso, errores de seguridad y efectos críticos con correlación y redacción de datos sensibles.
- Definir alertas sobre anomalías, fallos repetidos, denegaciones, escalamiento de privilegios y consumo anómalo.
- Mantener lockfiles, inventario de dependencias, análisis de vulnerabilidades, revisión de secretos e integridad de artefactos.
- Corregir vulnerabilidades según severidad, exposición y exploitabilidad; registrar aceptación de riesgo con responsable y fecha de revisión.
- Usar despliegues reproducibles, configuración separada, mínimo privilegio, health checks y rollback comprobado.

## 9. Puertas de calidad de seguridad

Antes de entregar un cambio relevante, ejecutar o justificar explícitamente:

1. Análisis estático, revisión de dependencias y detección de secretos.
2. Pruebas de autenticación, autorización, validación de entradas y manejo seguro de errores.
3. Pruebas de integración de persistencia, contratos, idempotencia y efectos externos relevantes.
4. Pruebas negativas de inyección, XSS, fuerza bruta y límites de abuso aplicables, en entorno autorizado.
5. Revisión de configuración, cabeceras, cookies, CORS, CSP, logging, retención y permisos.
6. Prueba de corrección que demuestre el control implantado y prevenga la regresión.

Una excepción temporal requiere ADR con alcance, mitigación, responsable, fecha de revisión y condición de retiro.
