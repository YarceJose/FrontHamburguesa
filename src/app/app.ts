import { Component, signal , input} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CircleComponent} from '../shared/components/circle/circle.component';

@Component({
  imports: [RouterOutlet,CircleComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
    color0 = signal<string>('#F9B637');
    color1 = signal<string>('#F9B637');
    color2 = signal<string>('#C00707');
    color3 = signal<string>('#C00707');
    maskImage = signal<string>('radial-gradient(circle, black 6%, transparent 60%)');

}
