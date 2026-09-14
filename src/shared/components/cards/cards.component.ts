import {Component, signal, input} from '@angular/core';


@Component({
  selector: 'app-cards-component',
  standalone: true,
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  title = input.required<string>();
  price = input.required<number>();
  url = input.required<string>();
}
