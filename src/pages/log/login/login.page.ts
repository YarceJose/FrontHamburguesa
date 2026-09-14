import { Component, signal, input } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ NgOptimizedImage],
})
export class LoginPage {
  height = signal<number>(450);

  Empresa = input<string>("Damon Apolo");

  constructor() {}
}
