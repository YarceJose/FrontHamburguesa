import { Component, signal } from '@angular/core';
import { CardsComponent } from '../../../shared/components/cards/cards.component';
import { NavMenuComponent } from '../../../shared/components/nav-Menu/navMenu.component';

interface Producto {
  title: string;
  price: number;
  url: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  imports: [CardsComponent],
})
export class MenuPage {
  title = signal<string>('Menu');

  productos: Producto[] = [
    { title: 'Carne de Res',        price: 19000, url: 'https://i.pinimg.com/736x/1e/45/1d/1e451d29ceec70905007c4f9552b29a1.jpg' },
    { title: 'Carne de Cerdo',      price: 19000, url: 'https://i.pinimg.com/736x/48/53/ce/4853cebd7448b719d7e4cf5f0f12f1db.jpg' },
    { title: 'Pechuga',             price: 19000, url: 'https://i.pinimg.com/736x/85/5e/ae/855eaeb368d8855ea1abf9713ce48497.jpg' },
    { title: 'Costillas Ahumadas',  price: 22000, url: 'https://i.pinimg.com/736x/75/85/6e/75856e3aaec4bb7ba3ce62f477b7229b.jpg' },
    { title: 'Carne Mixta',  price: 22000, url: 'https://i.pinimg.com/736x/99/0d/c2/990dc232b34f6effe8ebfc52b330c474.jpg' },
    { title: 'Costillas Ahumadas',  price: 22000, url: 'https://i.pinimg.com/736x/75/85/6e/75856e3aaec4bb7ba3ce62f477b7229b.jpg' },
  ];
}
