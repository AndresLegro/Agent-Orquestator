# Playbook: verificación defensiva de seguridad

Usar este procedimiento para cambios de autenticación, autorización, datos, API, persistencia, automatización, infraestructura o dependencia.

## 1. Alcance y autorización

- Confirmar propiedad del activo, entorno autorizado, responsables, ventana y límites de prueba.
- Identificar datos sensibles, operaciones irreversibles, integraciones externas y mecanismos de parada.
- Definir presupuesto máximo de solicitudes, concurrencia, duración y recursos para cualquier prueba de abuso o carga.
- No continuar si el alcance o el entorno no permiten una prueba segura.

## 2. Modelo de amenaza y requisitos

- Identificar activos, actores, fronteras de confianza, entradas, salidas, privilegios, efectos y dependencias.
- Mapear riesgos aplicables a OWASP ASVS, OWASP Top 10, OWASP API Security Top 10, CWE, NIST SSDF y NIST AI RMF cuando corresponda.
- Definir control esperado, oráculo, evidencia y criterio de aprobación para cada riesgo material.
- Registrar exclusiones justificadas y riesgos residuales con responsable.

## 3. Verificación de controles

- Probar autenticación, autorización por recurso y ámbito, gestión de sesión, expiración, revocación y respuestas no enumeradoras.
- Probar validación estricta, límites de entrada, consultas parametrizadas, codificación de salida, saneamiento y políticas de navegador.
- Ejecutar pruebas negativas de SQL injection y XSS mediante corpus de prueba aprobado y entorno aislado; verificar que no hay consulta alterada ni ejecución en navegador.
- Ejecutar secuencias limitadas de autenticación sintética para verificar límites contra fuerza bruta, auditoría, backoff y recuperación.
- Ejecutar pruebas de abuso y carga acotadas para verificar rate limits, cuotas, backpressure, timeouts, degradación y recuperación. Detenerse ante el criterio de parada definido.
- Verificar secretos, dependencias, configuración, CORS, CSP, cookies, logging, datos sensibles y permisos de infraestructura.

## 4. Evidencia y remediación

- Conservar evidencia redactada: configuración, versión, resultado, métricas, trazas, IDs de correlación y oráculo observado.
- Clasificar hallazgos por impacto, exposición, probabilidad y alcance; describir comportamiento observado y control faltante.
- Recomendar la corrección mínima que elimine la causa raíz y añadir prueba de regresión.
- Repetir exactamente la verificación tras corregir. No cerrar por ocultar mensajes, aumentar timeout o relajar la prueba.

## 5. Entrega

- Actualizar la matriz de trazabilidad y el estado de los controles.
- Bloquear entrega si faltan controles críticos sin aceptación de riesgo formal.
- Registrar ADR para cambios de estrategia, excepciones temporales, entorno de prueba o puerta de seguridad.
- Informar qué controles fueron comprobados, en qué entorno, con qué límites y qué riesgo residual permanece.
