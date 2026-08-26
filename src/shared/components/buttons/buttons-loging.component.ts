import {Component, input} from '@angular/core';


@Component({
  selector: 'buttons-loging',
  templateUrl: './buttons-loging.component.html',
  styleUrls: ['./buttons-loging.component.scss']
})
export class ButtonsLogingComponent {

  title = input<string>('Iniciar sesion');

}
