# Perfiles de proyecto

Un perfil contiene únicamente arquitectura de despliegue, contratos, clasificación de datos, mecanismos de autenticación, entornos autorizados o procedimientos de seguridad que sean exclusivos de un proyecto y no inferibles de su código actual.

Crear `profiles/<proyecto>/` cuando sea necesario. Cada perfil debe:

- Referenciar `../../AGENTS.md`, el estándar de seguridad y el adaptador técnico aplicable.
- Delimitar entornos autorizados, responsables, datos de prueba, límites de carga y criterios de parada.
- Mantener matriz de trazabilidad, contratos y excepciones revisables.
- Registrar toda excepción con alcance, mitigación, responsable, fecha de revisión y condición de retiro.
- Evitar lógica de negocio, ejemplos de clientes, material de explotación, credenciales o deuda no generalizable.

No crear un perfil para rebajar controles, justificar pruebas sin evidencia o habilitar pruebas de seguridad fuera de alcance.
