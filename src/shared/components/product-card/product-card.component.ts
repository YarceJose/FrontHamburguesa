import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { BRAND } from '../../../core/config/brand';
import { MenuProduct } from '../../../core/store/store.model';

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
  protected readonly fallbackImage = BRAND.logo;
}
