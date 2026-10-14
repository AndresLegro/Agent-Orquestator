# Reglas transversales para agentes de ingeniería

Este archivo es el contrato común para cualquier agente o colaborador que use este repositorio. Antes de actuar, leer el `README.md` y el `AGENTS.md` de la especialidad elegida.

## Objetivo

Construir y mantener software seguro, verificable, evolutivo y operable. Las decisiones preservan límites de arquitectura, contratos estables y entrega reproducible; no se optimizan únicamente para cerrar la tarea inmediata.

## Precedencia documental

Cuando dos documentos difieran, aplicar este orden: requisitos de seguridad y contratos vigentes → ADR aplicable más reciente → estándar de especialidad → adaptador técnico → perfil del proyecto e instrucciones locales → documentos históricos y planes.

Una excepción temporal requiere alcance, mitigación, responsable y fecha o condición verificable de retiro. Nunca se copia como patrón para cambios nuevos.

## Reglas transversales

- Entender flujo, contratos y estado actual antes de cambiar código.
- Validar datos no confiables en sus fronteras y no propagar detalles internos al consumidor.
- Toda frontera de transporte (HTTP, cola, webhook, job) declara DTOs explícitos de entrada y de salida. Nunca se aceptan parámetros sueltos ni se serializa una entidad de dominio, una fila de base de datos o el payload de un proveedor. La regla se verifica con una prueba automática de arquitectura, no solo en revisión.
- Preferir cambios cohesivos, comprobables, reversibles y proporcionales al riesgo.
- No introducir abstracciones, configuraciones ni compatibilidad especulativa.
- Versionar código, esquema, metadata y configuración declarativa; nunca secretos.
- Diseñar efectos externos con idempotencia, deduplicación o recuperación explícita.
- Mantener observabilidad útil sin exponer secretos ni datos personales innecesarios.
- Verificar comportamiento crítico con automatización y una prueba funcional adecuada al cambio.
- Diseñar para concurrencia real desde el primer día: acceso a datos indexado, caché con invalidación explícita, trabajo pesado fuera de la interacción del usuario, límites de recursos y evidencia de carga.
- Escribir todo el codigo en idioma ingles. 

## Escalabilidad obligatoria

Ninguna funcionalidad se considera terminada si solo funciona con un usuario. Todo cambio que acceda a datos, exponga un endpoint o ejecute trabajo costoso debe demostrar:

1. **Acceso a datos óptimo:** revisar plan de ejecución, índices, selectividad, proyección y paginación antes de aceptar una consulta. Detectar y eliminar consultas repetidas en bucle, lecturas sin límite y filtros no indexados.
2. **Caché con propósito:** definir qué se cachea, dónde, con qué clave, qué TTL, cómo se invalida y qué ocurre ante dato obsoleto. No se cachea lo que no se puede invalidar de forma correcta.
3. **Trabajo pesado asíncrono:** una operación larga no bloquea la petición ni la interacción. Se ejecuta fuera de la ruta crítica con estado consultable, reintento y resultado observable.
4. **Evidencia de carga:** los flujos críticos se prueban con al menos 100 usuarios concurrentes en un entorno autorizado antes de considerarlos listos para producción.
5. **Límites de recursos:** conexiones, concurrencia, memoria, tamaño de payload y tiempo tienen un techo explícito. Ningún componente puede agotar la base de datos ni un servicio dependiente.
6. **Diagnóstico exacto:** logs estructurados, correlación, métricas y trazas suficientes para identificar la causa concreta de un error sin reproducirlo manualmente.
7. **Protección ante abuso:** límites de tasa y cuotas por identidad, origen y operación, con respuesta segura y auditable.

Cuando un requisito no aplique, se registra la justificación. No se omite por falta de tiempo.

## Ciclo de trabajo obligatorio

1. Inspeccionar la especialidad, el perfil del proyecto, los contratos y los controles afectados.
2. Delimitar el cambio mínimo y sus efectos técnicos u operativos.
3. Implementar con pruebas proporcionales al riesgo.
4. Ejecutar validación estática, build y pruebas aplicables.
5. Actualizar contratos, decisiones y procedimientos afectados.
6. Informar con precisión qué se verificó y qué requiere validación posterior.

## Especialidades

Cada carpeta de especialidad contiene estándares, adaptadores, playbooks, plantillas y perfiles. Las especialidades actuales y futuras son backend, frontend, database, QA y DevOps. Ninguna guía de especialidad puede debilitar este contrato común.
