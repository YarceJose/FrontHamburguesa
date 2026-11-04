import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '../../../core/config/brand';
import { LoginFormComponent } from '../login-form/login-form.component';

/** /personal: sign-in for kitchen and delivery. */
@Component({
  selector: 'app-staff-login-page',
  imports: [LoginFormComponent, RouterLink],
  templateUrl: './staff-login.page.html',
  styleUrl: './staff-login.page.scss',
})
export class StaffLoginPage {
  /** ?motivo=cierre (admin closed the day) or ?motivo=sesion (session ended). */
  readonly motivo = input<string>();

  protected readonly brand = BRAND;
  protected readonly notice = computed(() => {
    switch (this.motivo()) {
      case 'cierre':
        return 'El administrador cerró la jornada. Hasta la próxima.';
      case 'sesion':
        return 'Tu sesión terminó. Ingresa de nuevo.';
      default:
        return null;
    }
  });
}
