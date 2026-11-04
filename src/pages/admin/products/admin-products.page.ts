import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toApiError } from '../../../core/api/api-error';
import { BRAND } from '../../../core/config/brand';
import { StoreAdminService } from '../../../core/store/store-admin.service';
import { AdminProduct, categoryLabel, productImageSrc } from '../../../core/store/store.model';
import { environment } from '../../../environments/environment';
import { SidePanelComponent } from '../../../shared/components/side-panel/side-panel.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { ProductFormComponent } from './product-form/product-form.component';

type Visibility = 'active' | 'hidden' | 'all';
type Panel = { kind: 'create' } | { kind: 'edit'; product: AdminProduct } | null;

/** /admin/productos: the menu the customers see. Create, edit, change the picture, hide or show. */
@Component({
  selector: 'app-admin-products-page',
  imports: [CurrencyPipe, TopbarComponent, SidePanelComponent, ProductFormComponent],
  templateUrl: './admin-products.page.html',
  styleUrl: './admin-products.page.scss',
})
export class AdminProductsPage {
  private readonly api = inject(StoreAdminService);

  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);
  protected readonly panel = signal<Panel>(null);
  protected readonly toast = signal<{ kind: 'success' | 'error'; text: string } | null>(null);

  protected readonly search = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly visibility = signal<Visibility>('active');

  protected readonly categoryLabel = categoryLabel;
  protected readonly fallbackImage = BRAND.logo;

  protected readonly categories = computed(() =>
    [...new Set(this.products().map((p) => p.category ?? 'otros'))].sort((a, b) => a.localeCompare(b)),
  );

  protected readonly counts = computed(() => {
    const all = this.products();
    const active = all.filter((p) => p.isActive).length;
    return { active, hidden: all.length - active, all: all.length, categories: this.categories().length };
  });

  protected readonly visible = computed(() => {
    const term = normalize(this.search());
    const category = this.category();
    const visibility = this.visibility();
    return this.products().filter(
      (p) =>
        (visibility === 'all' || p.isActive === (visibility === 'active')) &&
        (category === null || (p.category ?? 'otros') === category) &&
        (!term || normalize(`${p.name} ${p.description ?? ''}`).includes(term)),
    );
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.products().subscribe({
      next: (list) => {
        this.products.set(list);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(toApiError(err).message);
        this.loading.set(false);
      },
    });
  }

  protected image(product: AdminProduct): string {
    return productImageSrc(product, environment.apiUrl) ?? this.fallbackImage;
  }

  protected openCreate(): void {
    this.panel.set({ kind: 'create' });
  }

  protected openEdit(product: AdminProduct): void {
    this.panel.set({ kind: 'edit', product });
  }

  protected closePanel(): void {
    this.panel.set(null);
  }

  protected onSaved(event: { product: AdminProduct; created: boolean }): void {
    this.upsert(event.product);
    this.closePanel();
    this.showToast('success', event.created ? `${event.product.name} ya está en el menú.` : 'Cambios guardados.');
  }

  /** Quick hide/show from the list (e.g. the product ran out tonight). */
  protected toggleActive(product: AdminProduct): void {
    this.busyId.set(product.id);
    this.api
      .updateProduct(product.id, {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        isActive: !product.isActive,
      })
      .subscribe({
        next: (saved) => {
          this.upsert(saved);
          this.busyId.set(null);
          this.showToast('success', saved.isActive ? `${saved.name} vuelve a estar en el menú.` : `${saved.name} se ocultó del menú.`);
        },
        error: (err: unknown) => {
          this.busyId.set(null);
          this.showToast('error', toApiError(err).message);
        },
      });
  }

  private upsert(product: AdminProduct): void {
    this.products.update((list) =>
      list.some((p) => p.id === product.id) ? list.map((p) => (p.id === product.id ? product : p)) : [product, ...list],
    );
  }

  private showToast(kind: 'success' | 'error', text: string): void {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3500);
  }
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
