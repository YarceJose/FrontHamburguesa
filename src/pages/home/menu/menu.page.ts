import {Component, signal} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  imports: [NgOptimizedImage],
})
export class MenuPage {
  //Variables
  title = signal<string>('Menu');
}
