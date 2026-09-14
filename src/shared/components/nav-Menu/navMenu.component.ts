import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './navMenu.component.html',
  styleUrls: ['./navMenu.component.scss']
})
export class NavMenuComponent {
  @Input() isOpen: boolean = false;
}
