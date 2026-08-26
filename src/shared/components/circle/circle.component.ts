import {Component, input} from '@angular/core';

@Component({
  selector: 'circle-component',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent {
  color = input<string>('gray');
  left = input<number>(0);
  top = input<number>(0);
  size = input<number>(200);
  boxShadow = input<string>('0px 0px 0px rgba(0, 0, 0, 0)');
  maskImage = input<string>('-webkit-mask-image: radial-gradient(circle, black 60%, transparent 100%)');
}
