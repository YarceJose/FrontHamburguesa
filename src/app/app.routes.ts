import { Routes } from '@angular/router';
import { roleGuard } from '../core/auth/auth.guards';

export const routes: Routes = [
  {
    // Public home + menu + cart. The sign-in (every staff role) only appears with ?admin=true
    path: '',
    title: 'Comidas donde Piedad',
    loadComponent: () => import('../pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'pedido/:code',
    title: 'Tu pedido',
    loadComponent: () => import('../pages/order/track/track.page').then((m) => m.TrackPage),
  },
  // Old staff sign-in address: everyone signs in from the home page with ?admin=true now
  { path: 'personal', redirectTo: '' },
  {
    path: 'cocina',
    title: 'Cocina',
    canActivate: [roleGuard('Cook')],
    loadComponent: () => import('../pages/staff/kitchen/kitchen.page').then((m) => m.KitchenPage),
  },
  {
    path: 'domicilios',
    title: 'Domicilios',
    canActivate: [roleGuard('Delivery')],
    loadComponent: () => import('../pages/staff/delivery/delivery.page').then((m) => m.DeliveryPage),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('Admin')],
    children: [
      {
        path: '',
        title: 'Pedidos',
        loadComponent: () => import('../pages/admin/orders/admin-orders.page').then((m) => m.AdminOrdersPage),
      },
      {
        path: 'productos',
        title: 'Productos',
        loadComponent: () => import('../pages/admin/products/admin-products.page').then((m) => m.AdminProductsPage),
      },
      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () => import('../pages/admin/users/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: 'tienda',
        title: 'Tienda',
        loadComponent: () => import('../pages/admin/store/admin-store.page').then((m) => m.AdminStorePage),
      },
      {
        path: 'perfil',
        title: 'Mi perfil',
        loadComponent: () => import('../pages/admin/profile/admin-profile.page').then((m) => m.AdminProfilePage),
      },
    ],
  },
  { path: 'menu', redirectTo: '' },
  { path: '**', redirectTo: '' },
];
