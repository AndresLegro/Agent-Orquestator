# Perfiles de proyecto

Un perfil contiene únicamente reglas, contratos, decisiones y procedimientos que son exclusivos de un proyecto y no se pueden inferir de su código actual.

Crear `profiles/<proyecto>/` cuando sea necesario. Cada perfil debe:

- Referenciar `../../AGENTS.md`, el estándar backend y el adaptador técnico aplicable.
- Separar hechos vigentes de deuda o excepciones temporales.
- Registrar excepciones con alcance, mitigación, responsable y condición de retiro.
- Evitar detalles de negocio que no sean necesarios para construir o mantener software de forma segura.

No crear un perfil para repetir convenciones universales, dependencias que ya se descubren desde el repositorio o decisiones transitorias sin impacto arquitectónico.
