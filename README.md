# Repositorio de agentes de ingeniería

Este repositorio contiene instrucciones versionables para agentes especializados y colaboradores. Su objetivo es reutilizar principios de ingeniería sin trasladar detalles de un proyecto a otro.

## Uso

1. Leer `AGENTS.md` en la raíz.
2. Entrar a la especialidad requerida, por ejemplo `backend/`.
3. Leer el `AGENTS.md` de esa especialidad.
4. Cargar el estándar, el adaptador del stack y el perfil del proyecto cuando exista.
5. Usar el playbook que corresponda al cambio.

## Estructura

```text
<especialidad>/
├─ AGENTS.md       # Entrada y orden de lectura de la especialidad
├─ standards/      # Principios independientes de framework
├─ adapters/       # Aplicación genérica a un stack técnico
├─ playbooks/      # Procedimientos repetibles
├─ templates/      # Plantillas para decisiones y entregables
└─ profiles/       # Reglas y decisiones exclusivas de cada proyecto
```

Los perfiles no redefinen el estándar. Añaden restricciones, arquitectura vigente, contratos, excepciones documentadas y comandos verificables de un proyecto concreto.

## Escalabilidad transversal

Todas las especialidades comparten el requisito de que el producto funcione con muchos usuarios simultáneos. Ver la sección correspondiente en `AGENTS.md` y el resumen de responsabilidades en `HowToImplement.md`.

## Especialidades

- `backend/`: arquitectura, contratos, integraciones, seguridad, escalabilidad y operación de servicios.
- `frontend/`: experiencia, accesibilidad, estado, rutas, contratos remotos, caché y rendimiento de interfaces.
- `database/`: pendiente.
- `qa/`: evidencia de calidad, integración real, contratos, persistencia, resiliencia, carga y extremo a extremo.
- `security/`: seguridad defensiva, estándares OWASP/NIST, verificación de controles y resiliencia ante abuso.
- `devops/`: pendiente.
