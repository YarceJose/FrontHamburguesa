import { Component, input } from '@angular/core';

@Component({
  selector: 'aside-component',
  standalone: true,
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent {
  height =input<number>(300)
}
