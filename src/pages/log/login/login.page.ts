import { Component, signal } from '@angular/core';

import { AsideComponent } from '../../../shared/components/aside/aside.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [AsideComponent],
})
export class LoginPage {
  height = signal<number>(600);

  constructor() {}
}
