import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.scss',
})
export class MenuPage {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search'>('text');
  readonly width = input<number>(30);
  readonly height = input<number>(10);
  readonly placeholder = input<string>('title');
  readonly id = input.required<string>();
  readonly value = model<string>('');
}
