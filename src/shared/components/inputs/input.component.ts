import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search'>('text');
  readonly width = input<number>(30);
  readonly height = input<number>(10);
  readonly placeholder = input<string>('title');
  readonly id = input.required<string>();
  readonly value = model<string>('');
}
