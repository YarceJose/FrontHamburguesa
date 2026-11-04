import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { BRAND } from '../../../core/config/brand';
import { MenuProduct, productImageSrc } from '../../../core/store/store.model';
import { environment } from '../../../environments/environment';

/** Menu product (Figma Frame 4 card). */
@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<MenuProduct>();
  readonly quantity = input(0);
  readonly add = output<MenuProduct>();
  readonly disabled = input(false);
  protected readonly image = computed(() => productImageSrc(this.product(), environment.apiUrl) ?? BRAND.logo);
}
