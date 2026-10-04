import { Routes } from '@angular/router';

const SITE = 'PANHASHOP';

export const routes: Routes = [
  {
    path: '',
    title: `${SITE} — Modern products for modern living`,
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    title: `Products | ${SITE}`,
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'products/:id',
    title: `Product | ${SITE}`,
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    title: `Your Cart | ${SITE}`,
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    title: `Checkout | ${SITE}`,
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'about',
    title: `About Us | ${SITE}`,
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'help',
    title: `Help Center | ${SITE}`,
    loadComponent: () => import('./pages/help/help').then((m) => m.Help),
  },
  {
    path: 'contact',
    title: `Contact | ${SITE}`,
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: '**',
    title: `Page not found | ${SITE}`,
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
