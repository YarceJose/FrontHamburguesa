import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { toApiError } from '../../../../core/api/api-error';
import { StoreAdminService } from '../../../../core/store/store-admin.service';
import { AdminProduct, categoryLabel, productImageSrc } from '../../../../core/store/store.model';
import { environment } from '../../../../environments/environment';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Creates or edits a menu product: data first, then its picture (upload, link or none). */
@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly api = inject(StoreAdminService);

  /** null = new product. */
  readonly product = input<AdminProduct | null>(null);
  /** Existing categories, suggested while typing. */
  readonly categories = input<string[]>([]);
  readonly saved = output<{ product: AdminProduct; created: boolean }>();
  readonly cancel = output<void>();

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly file = signal<File | null>(null);
  protected readonly removeUploaded = signal(false);
  private readonly filePreview = signal<string | null>(null);

  protected readonly isNew = computed(() => this.product() === null);
  protected readonly categoryLabel = categoryLabel;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    category: ['', [Validators.maxLength(40)]],
    price: [0, [Validators.required, Validators.min(1), Validators.max(10_000_000)]],
    description: ['', [Validators.maxLength(300)]],
    imageUrl: ['', [Validators.pattern(/^https?:\/\/\S+$/), Validators.maxLength(500)]],
    isActive: [true],
  });

  /** What the card will show: the new file, else the uploaded picture, else the link. */
  protected readonly preview = computed(() => {
    const local = this.filePreview();
    if (local) return local;
    const p = this.product();
    if (p && !this.removeUploaded()) {
      return productImageSrc(p, environment.apiUrl);
    }
    return p?.imageUrl ?? null;
  });

  protected readonly hasUploaded = computed(() => this.product()?.imageVersion != null && !this.removeUploaded());

  ngOnInit(): void {
    const p = this.product();
    if (p) {
      this.form.reset({
        name: p.name,
        category: p.category ? categoryLabel(p.category) : '',
        price: p.price,
        description: p.description ?? '',
        imageUrl: p.imageUrl ?? '',
        isActive: p.isActive,
      });
    }
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  protected pickFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      this.fileError.set('Usa una imagen JPG, PNG o WEBP de máximo 5 MB.');
      return;
    }
    this.fileError.set(null);
    this.revokePreview();
    this.file.set(file);
    this.filePreview.set(URL.createObjectURL(file));
  }

  protected clearImage(): void {
    this.revokePreview();
    this.file.set(null);
    this.filePreview.set(null);
    if (this.product()?.imageVersion != null) this.removeUploaded.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const request = {
      name: v.name.trim(),
      price: v.price,
      category: v.category.trim() || null,
      description: v.description.trim() || null,
      imageUrl: v.imageUrl.trim() || null,
      isActive: v.isActive,
    };
    const current = this.product();
    const file = this.file();

    this.saving.set(true);
    this.error.set(null);
    (current ? this.api.updateProduct(current.id, request) : this.api.createProduct(request))
      .pipe(switchMap((saved) => this.syncImage(saved, file)))
      .subscribe({
        next: (product) => this.saved.emit({ product, created: current === null }),
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

  private syncImage(saved: AdminProduct, file: File | null): Observable<AdminProduct> {
    if (file) return this.api.uploadProductImage(saved.id, file);
    if (this.removeUploaded() && saved.imageVersion !== null) return this.api.removeProductImage(saved.id);
    return of(saved);
  }

  private revokePreview(): void {
    const url = this.filePreview();
    if (url) URL.revokeObjectURL(url);
  }
}
