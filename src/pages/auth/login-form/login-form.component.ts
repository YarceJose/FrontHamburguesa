import { afterNextRender, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toApiError } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';

/** Username + password sign-in shared by the admin panel and /personal. */
@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styles: `.form { display: grid; gap: 16px; }`,
})
export class LoginFormComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Roles allowed in this entry point; anyone else is told where to sign in. */
  readonly allowedRoles = input.required<UserRole[]>();
  readonly wrongRoleMessage = input('Este acceso no es para tu rol.');

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', Validators.required],
  });

  constructor() {
    afterNextRender(() => document.getElementById('login-username')?.focus());
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login({ username: username.trim().toLowerCase(), password }).subscribe({
      next: (user) => {
        if (!this.allowedRoles().includes(user.role)) {
          this.auth.forget(); // signed in at the wrong door: drop the session silently
          this.error.set(this.wrongRoleMessage());
          this.loading.set(false);
          return;
        }
        void this.router.navigateByUrl(this.auth.homeUrl(user.role));
      },
      error: (err: unknown) => {
        this.error.set(toApiError(err).message);
        this.loading.set(false);
      },
    });
  }

  protected invalid(name: 'username' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
}
