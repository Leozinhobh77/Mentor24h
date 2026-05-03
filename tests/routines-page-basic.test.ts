import fs from 'fs';
import path from 'path';

describe('RoutinesPage Component - Basic Validation', () => {
  const componentPath = path.join(__dirname, '../src/components/routines/RoutinesPage.tsx');

  test('component file should exist', () => {
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  test('component should have proper structure', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('use client');
    expect(content).toContain('export function RoutinesPage');
    expect(content).toContain('useAuth');
    expect(content).toContain('useEffect');
    expect(content).toContain('useState');
  });

  test('component should import required dependencies', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain("import { useEffect, useState }");
    expect(content).toContain("import { useAuth }");
    expect(content).toContain("from 'date-fns'");
  });

  test('component should have fetch logic', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain("fetch('/api/routines/status'");
    expect(content).toContain('fetchRoutines');
  });

  test('component should have loading state', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('isLoading');
    expect(content).toContain('Carregando rotinas');
  });

  test('component should have error handling', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('error');
    expect(content).toContain('setError');
  });

  test('component should render routine cards', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('Rotinas Automáticas');
    expect(content).toContain('routines.map');
    expect(content).toContain('getRoutineIcon');
  });

  test('component should have proper interface definitions', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('interface RoutineStatus');
    expect(content).toContain('name: string');
    expect(content).toContain('type: string');
    expect(content).toContain('enabled: boolean');
    expect(content).toContain('lastExecuted: string | null');
    expect(content).toContain('nextExecution: string');
    expect(
      content.includes('lastResult?: Record<string, any> | null') ||
      content.includes('lastResult: Record<string, any> | null')
    ).toBe(true);
  });

  test('component should have routine type handling', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain("case 'weekly-summary'");
    expect(content).toContain("case 'pattern-analysis'");
    expect(content).toContain("case 'daily-wellbeing'");
  });

  test('component should display routine icons', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('📊');
    expect(content).toContain('📈');
    expect(content).toContain('🌟');
    expect(content).toContain('⚙️');
  });

  test('component should have date formatting', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('formatDate');
    expect(content).toContain('Nunca executada');
    expect(content).toContain('Data inválida');
  });

  test('component should display status badges', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('Ativa');
    expect(content).toContain('Inativa');
  });

  test('component should have responsive layout', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('max-w-6xl');
    expect(content).toContain('grid');
    expect(content).toContain('md:');
  });

  test('component should be a function component', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('function RoutinesPage()');
  });

  test('component should return JSX', () => {
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('return');
    expect(content).toContain('<div');
  });
});
