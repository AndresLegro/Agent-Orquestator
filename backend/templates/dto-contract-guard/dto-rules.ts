import * as ts from 'typescript';

const HTTP_METHOD_DECORATORS = new Set([
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'Head',
  'Options',
]);
const INPUT_DECORATORS = new Set(['Body', 'Query', 'Param']);

function decoratorName(decorator: ts.Decorator): string | undefined {
  const expression = decorator.expression;
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
    return expression.expression.text;
  }
  return ts.isIdentifier(expression) ? expression.text : undefined;
}

function decoratorsOf(node: ts.Node): ts.Decorator[] {
  return ts.canHaveDecorators(node) ? [...(ts.getDecorators(node) ?? [])] : [];
}

function isDtoTypeReference(type: ts.TypeNode | undefined): boolean {
  return (
    type !== undefined &&
    ts.isTypeReferenceNode(type) &&
    ts.isIdentifier(type.typeName) &&
    type.typeName.text.endsWith('Dto')
  );
}

/** True when the type text mentions at least one identifier ending in `Dto`. */
function mentionsDto(type: ts.TypeNode | undefined, source: ts.SourceFile): boolean {
  return type !== undefined && /\b\w+Dto\b/.test(type.getText(source));
}

/**
 * Checks the DTO contract of one controller file and returns the violations.
 *
 * - Every `@Body()`, `@Query()` and `@Param()` parameter is typed with a `*Dto` class
 *   (that is what the global ValidationPipe validates; a primitive or an inline type
 *   skips validation).
 * - Every route handler declares its return type and it mentions a `*Dto` class, so
 *   a domain entity or a driver row is never serialized by accident.
 * - The controller does not import domain entities.
 */
export function findDtoViolations(sourceText: string, fileName: string): string[] {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const violations: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (/\/domain\/entities\//.test(node.moduleSpecifier.text)) {
        violations.push(
          `${fileName}: a controller must not import domain entities (${node.moduleSpecifier.text}); map them to a response DTO in the application layer`,
        );
      }
    }

    if (ts.isMethodDeclaration(node)) {
      const route = decoratorsOf(node).some((d) =>
        HTTP_METHOD_DECORATORS.has(decoratorName(d) ?? ''),
      );
      if (route) {
        const method = node.name.getText(source);

        if (!node.type) {
          violations.push(`${fileName}: handler "${method}" must declare its return type`);
        } else if (!mentionsDto(node.type, source)) {
          violations.push(
            `${fileName}: handler "${method}" must return a response DTO (found ${node.type.getText(source)})`,
          );
        }

        for (const parameter of node.parameters) {
          const input = decoratorsOf(parameter).find((d) =>
            INPUT_DECORATORS.has(decoratorName(d) ?? ''),
          );
          if (input && !isDtoTypeReference(parameter.type)) {
            violations.push(
              `${fileName}: parameter "${parameter.name.getText(source)}" of "${method}" (@${decoratorName(input)}) must be typed with a *Dto class`,
            );
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return violations;
}
