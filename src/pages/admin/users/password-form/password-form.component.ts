import { Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toApiError } from '../../../../core/api/api-error';
import { ROLE_LABELS, User } from '../../../../core/models/user.model';
import { generatePassword } from '../../../../core/users/password';
import { UsersService } from '../../../../core/users/users.service';

/** An admin sets a new password for a staff member. */
@Component({
  selector: 'app-password-form',
  imports: [ReactiveFormsModule],
  templateUrl: './password-form.component.html',
  styleUrl: '../user-form/user-form.component.scss',
})
export class PasswordFormComponent {
  private readonly usersApi = inject(UsersService);

  readonly user = input.required<User>();
  readonly done = output<User>();
  readonly cancel = output<void>();

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly copied = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected generate(): void {
    this.form.controls.newPassword.setValue(generatePassword());
    this.showPassword.set(true);
    this.copied.set(false);
  }

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.form.controls.newPassword.value);
    this.copied.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.usersApi.resetPassword(this.user().id, this.form.getRawValue().newPassword).subscribe({
      next: () => this.done.emit(this.user()),
      error: (err: unknown) => {
        this.error.set(toApiError(err).message);
        this.saving.set(false);
      },
    });
  }

  protected invalid(): boolean {
    const control = this.form.controls.newPassword;
    return control.invalid && control.touched;
  }
}
