import { Component, input } from "@angular/core";
import {LucideAngularModule, Mail} from 'lucide-angular'

@Component({
  selector: 'input-component',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './Inputs.component.html',
  styleUrls: ['./Inputs.component.scss'],
})

export class InputCoponent{
  type = input <string>('text')
  width = input <number>(30)
  Height = input <number>(10)
  placeholder = input <string>('title')
  //Iconos
}
