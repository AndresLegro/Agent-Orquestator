# Perfiles de proyecto

Un perfil contiene únicamente contratos, infraestructura de prueba, datos de referencia, políticas de retención o procedimientos de calidad exclusivos de un proyecto y no inferibles de su código actual.

Crear `profiles/<proyecto>/` cuando sea necesario. Cada perfil debe:

- Referenciar `../../AGENTS.md`, el estándar QA y el adaptador técnico aplicable.
- Definir cómo se crean, aíslan y destruyen los entornos reales o controlados de integración.
- Mantener contratos, semillas y criterios de aceptación versionados y revisables.
- Registrar excepciones con alcance, mitigación, responsable y condición de retiro.
- Evitar lógica de negocio, ejemplos de clientes, proveedores concretos o deuda no generalizable.

No crear un perfil para repetir principios universales ni para justificar pruebas superficiales o entornos compartidos no deterministas.
