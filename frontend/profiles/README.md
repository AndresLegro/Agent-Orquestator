# Perfiles de proyecto

Un perfil contiene únicamente contratos visuales, decisiones de arquitectura, reglas de seguridad, procedimientos o convenciones que son exclusivos de un proyecto y no se pueden inferir de su código actual.

Crear `profiles/<proyecto>/` cuando sea necesario. Cada perfil debe:

- Referenciar `../../AGENTS.md`, el estándar frontend y el adaptador técnico aplicable.
- Separar hechos vigentes de deuda o excepciones temporales.
- Registrar excepciones con alcance, mitigación, responsable y condición de retiro.
- Evitar lógica de negocio, ejemplos de clientes e integraciones que no sean necesarias para construir o mantener software de forma segura.

No crear un perfil para repetir principios universales, dependencias detectables desde el repositorio o decisiones temporales sin impacto arquitectónico.
