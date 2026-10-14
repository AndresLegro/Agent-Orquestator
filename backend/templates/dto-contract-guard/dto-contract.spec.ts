import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findDtoViolations } from '../testing/dto-rules';

const SRC = join(__dirname, '..');

function collect(dir: string, suffix: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return collect(path, suffix);
    return path.endsWith(suffix) ? [path] : [];
  });
}

/**
 * Architecture guard: every HTTP boundary uses DTOs. It scans every controller
 * under src, so a new module or endpoint is covered without registering it here.
 * Rule and rationale: agent-orchestrator/backend/standards/backend-engineering.md
 * ("DTOs obligatorios en toda frontera de transporte").
 */
describe('DTO contract of the HTTP boundary', () => {
  const controllers = collect(SRC, '.controller.ts');

  it('finds the controllers (the scan is not vacuous)', () => {
    expect(controllers.length).toBeGreaterThanOrEqual(3);
  });

  it.each(controllers.map((file) => [relative(SRC, file), file]))(
    '%s only accepts and returns DTOs',
    (_name, file) => {
      expect(findDtoViolations(readFileSync(file, 'utf8'), relative(SRC, file))).toEqual([]);
    },
  );

  it('the global ValidationPipe whitelists and rejects unknown properties', () => {
    const setup = readFileSync(join(SRC, 'app.setup.ts'), 'utf8');

    expect(setup).toMatch(/whitelist:\s*true/);
    expect(setup).toMatch(/forbidNonWhitelisted:\s*true/);
    expect(setup).toMatch(/transform:\s*true/);
  });
});

describe('findDtoViolations (the rule itself detects what it should)', () => {
  const wrap = (body: string) => `
    import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
    @Controller('x')
    export class XController { ${body} }`;

  it('accepts DTO input and DTO output', () => {
    const source = wrap(`
      @Get() list(@Query() q: PageQueryDto): Promise<ApiResponseDto<ItemDto>> { return null as never; }`);
    expect(findDtoViolations(source, 'ok.controller.ts')).toEqual([]);
  });

  it('flags a handler without return type', () => {
    const source = wrap(`@Get() list(@Query() q: PageQueryDto) { return 1; }`);
    expect(findDtoViolations(source, 'bad.controller.ts')).toEqual([
      expect.stringContaining('must declare its return type'),
    ]);
  });

  it('flags a handler that returns something that is not a DTO', () => {
    const source = wrap(`@Get() list(): Promise<Invoice[]> { return null as never; }`);
    expect(findDtoViolations(source, 'bad.controller.ts')).toEqual([
      expect.stringContaining('must return a response DTO'),
    ]);
  });

  it.each([
    [
      'a primitive @Param',
      `@Get(':id') one(@Param('id') id: string): ItemDto { return null as never; }`,
    ],
    [
      'an inline @Body type',
      `@Post() add(@Body() b: { name: string }): ItemDto { return null as never; }`,
    ],
    [
      'a raw @Query',
      `@Get() list(@Query() q: Record<string, string>): ItemDto { return null as never; }`,
    ],
  ])('flags %s', (_label, body) => {
    expect(findDtoViolations(wrap(body), 'bad.controller.ts')).toEqual([
      expect.stringContaining('must be typed with a *Dto class'),
    ]);
  });

  it('flags the import of a domain entity in a controller', () => {
    const source = `import type { Invoice } from '../../domain/entities/invoice';\n${wrap(
      `@Get() list(): ItemDto { return null as never; }`,
    )}`;
    expect(findDtoViolations(source, 'bad.controller.ts')).toEqual([
      expect.stringContaining('must not import domain entities'),
    ]);
  });
});
