import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/home/menu/menu.page')
        .then(m => m.MenuPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/log/login/login.page')
        .then(m => m.LoginPage),
  },
];
