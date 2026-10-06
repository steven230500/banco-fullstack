import { ComponentFixture } from '@angular/core/testing';

export function byTestId<T extends HTMLElement = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  testId: string,
): T | null {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(`[data-testid="${testId}"]`);
}

export function allByTestId<T extends HTMLElement = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  testId: string,
): T[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<T>(`[data-testid="${testId}"]`),
  );
}

export function textOf(fixture: ComponentFixture<unknown>, testId: string): string {
  return byTestId(fixture, testId)?.textContent?.trim() ?? '';
}

export function escribir(elemento: HTMLInputElement | HTMLSelectElement, valor: string): void {
  elemento.value = valor;
  elemento.dispatchEvent(new Event(elemento instanceof HTMLSelectElement ? 'change' : 'input'));
  elemento.dispatchEvent(new Event('blur'));
}

export function clic(elemento: HTMLElement | null): void {
  if (!elemento) {
    throw new Error('Elemento no encontrado para hacer clic');
  }
  elemento.click();
}

export async function estabilizar(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}
