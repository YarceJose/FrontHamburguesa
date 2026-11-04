import { Component, output } from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form.component';

/** Admin sign-in panel (only reachable with ?admin=true). The JWT stays behind the scenes. */
@Component({
  selector: 'app-admin-access',
  imports: [LoginFormComponent],
  template: `
    <header class="panel-head">
      <p class="eyebrow restricted"><span class="dot" aria-hidden="true"></span> Acceso restringido</p>
      <h2 class="panel-head__title">Administrador</h2>
      <p class="panel-head__subtitle">Ingresa con tu usuario y contraseña.</p>
    </header>
    <app-login-form [allowedRoles]="['Admin']" wrongRoleMessage="Cocina y domicilios ingresan en /personal." />
    <button class="back" type="button" (click)="cancel.emit()">Cancelar</button>
  `,
  styles: `
    :host { display: grid; gap: 20px; }
    .restricted { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-weight: 700; color: var(--color-accent); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); box-shadow: 0 0 0 4px rgb(192 7 7 / 0.15); }
    .back { justify-self: center; border: none; background: none; font-size: 0.85rem; color: var(--color-text-muted); }
    .back:hover { color: var(--color-primary); }
  `,
})
export class AdminAccessComponent {
  readonly cancel = output<void>();
}
