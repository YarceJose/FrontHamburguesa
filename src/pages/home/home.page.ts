import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { BRAND } from '../../core/config/brand';
import { OrdersService } from '../../core/orders/orders.service';
import { categoryLabel, MenuProduct, StoreStatus } from '../../core/store/store.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SidePanelComponent } from '../../shared/components/side-panel/side-panel.component';
import { AdminAccessComponent } from '../auth/admin-access/admin-access.component';
import { CartLine, CheckoutComponent } from '../order/checkout/checkout.component';

/**
 * Main public view: brand hero (Figma Frame 1) + menu from the API (Figma Frame 4) + cart.
 * Customers order without an account. The staff sign-in (every role) only appears with ?admin=true.
 */
@Component({
  selector: 'app-home-page',
  imports: [CurrencyPipe, RouterLink, ProductCardComponent, SidePanelComponent, AdminAccessComponent, CheckoutComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly orders = inject(OrdersService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Bound from the ?admin= query param (withComponentInputBinding). */
  readonly admin = input<string>();
  /** ?motivo= after a session ended; opens the sign-in with the explanation. */
  readonly motivo = input<string>();

  protected readonly brand = BRAND;
  protected readonly adminEnabled = computed(() => this.admin() === 'true');
  protected readonly panel = signal<'access' | 'checkout' | null>(null);

  // ---------- Store and menu ----------
  protected readonly status = signal<StoreStatus | null>(null);
  protected readonly products = signal<MenuProduct[]>([]);
  protected readonly menuError = signal<string | null>(null);
  protected readonly loadingMenu = signal(true);
  protected readonly selectedCategory = signal<string | null>(null);

  protected readonly categories = computed(() =>
    [...new Set(this.products().map((p) => p.category ?? 'otros'))].map((id) => ({
      id,
      label: categoryLabel(id),
    })),
  );
  protected readonly visibleProducts = computed(() => {
    const category = this.selectedCategory();
    return category ? this.products().filter((p) => (p.category ?? 'otros') === category) : this.products();
  });

  protected readonly closedMessage = computed(() => {
    const s = this.status();
    if (!s || s.acceptingOrders) return null;
    switch (s.reason) {
      case 'outside_schedule':
        return `Estamos cerrados. Atendemos de ${s.opensAt.slice(0, 5)} a ${s.closesAt.slice(0, 5)}.`;
      case 'at_capacity':
        return 'Tenemos muchos pedidos en este momento. Vuelve a intentarlo en unos minutos.';
      default:
        return 'Por ahora no estamos recibiendo pedidos.';
    }
  });

  // ---------- Cart ----------
  private readonly cart = signal<ReadonlyMap<number, number>>(new Map());
  protected readonly cartLines = computed<CartLine[]>(() =>
    this.products()
      .filter((p) => this.cart().has(p.id))
      .map((p) => ({ product: p, quantity: this.cart().get(p.id)! })),
  );
  protected readonly cartCount = computed(() => this.cartLines().reduce((a, l) => a + l.quantity, 0));
  protected readonly cartTotal = computed(() => this.cartLines().reduce((a, l) => a + l.product.price * l.quantity, 0));

  constructor() {
    // Coming back from a closed session: show the sign-in right away with the reason
    effect(() => {
      if (this.adminEnabled() && this.motivo() && !this.auth.isAuthenticated()) untracked(() => this.panel.set('access'));
    });
    this.orders.storeStatus().subscribe({ next: (s) => this.status.set(s), error: () => this.status.set(null) });
    this.orders.menu().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadingMenu.set(false);
      },
      error: (err: unknown) => {
        this.menuError.set(toApiError(err).message);
        this.loadingMenu.set(false);
      },
    });
  }

  protected quantityOf(product: MenuProduct): number {
    return this.cart().get(product.id) ?? 0;
  }

  protected addToCart(product: MenuProduct): void {
    this.cart.update((cart) => new Map(cart).set(product.id, (cart.get(product.id) ?? 0) + 1));
  }

  protected changeQuantity(productId: number, delta: number): void {
    this.cart.update((cart) => {
      const next = new Map(cart);
      const quantity = (next.get(productId) ?? 0) + delta;
      if (quantity <= 0) next.delete(productId);
      else next.set(productId, Math.min(quantity, 50));
      return next;
    });
  }

  protected clearCart(): void {
    this.cart.set(new Map());
  }

  /** Scrolls without touching the URL, so ?admin=true is kept. */
  protected scrollToMenu(): void {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected onPlaced(code: string): void {
    this.panel.set(null);
    this.clearCart();
    void this.router.navigate(['/pedido', code]);
  }
}
