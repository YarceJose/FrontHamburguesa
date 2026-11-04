import { Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toApiError } from '../../../../core/api/api-error';
import { ROLE_LABELS, StaffRole, User } from '../../../../core/models/user.model';
import { generatePassword } from '../../../../core/users/password';
import { UsersService } from '../../../../core/users/users.service';

/** Creates Cook or Delivery users. Admins and customers are not created from here. */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  private readonly usersApi = inject(UsersService);

  readonly created = output<User>();
  readonly cancel = output<void>();

  protected readonly staffRoles: StaffRole[] = ['Cook', 'Delivery'];
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly copied = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._-]{3,30}$/)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]],
    role: ['Cook' as StaffRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected generate(): void {
    this.form.controls.password.setValue(generatePassword());
    this.showPassword.set(true);
    this.copied.set(false);
  }

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.form.controls.password.value);
    this.copied.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.usersApi
      .create({
        ...value,
        fullName: value.fullName.trim(),
        username: value.username.trim().toLowerCase(),
        email: value.email.trim() || null,
        phone: value.phone.trim() || null,
      })
      .subscribe({
        next: (user) => this.created.emit(user),
        error: (err: unknown) => {
          this.error.set(toApiError(err).message);
          this.saving.set(false);
        },
      });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
}
