import { Injectable, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, CartItem } from '../models/product';

export type { CartItem };

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'shopora_cart';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  readonly items = this.cartItems.asReadonly();

  readonly cartCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );

  readonly cartTotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  readonly isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    effect(() => {
      const current = this.cartItems();
      this.saveCartToStorage(current);
    });
  }

  addToCart(product: Product, quantity = 1): boolean {
    if (!product || product.stock <= 0) {
      return false;
    }

    let addedSuccessfully = false;

    this.cartItems.update((items) => {
      const existingIndex = items.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const existing = items[existingIndex];
        const maxAllowed = product.stock;

        if (existing.quantity >= maxAllowed) {
          addedSuccessfully = false;
          return items;
        }

        const newQuantity = Math.min(maxAllowed, existing.quantity + quantity);
        addedSuccessfully = true;

        return items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: newQuantity } : item,
        );
      }

      const initialQuantity = Math.min(product.stock, Math.max(1, quantity));
      addedSuccessfully = true;
      return [
        ...items,
        {
          product,
          quantity: initialQuantity,
        },
      ];
    });

    return addedSuccessfully;
  }

  increase(productId: number): boolean {
    let increased = false;

    this.cartItems.update((items) =>
      items.map((item) => {
        if (item.product.id === productId) {
          if (item.quantity < item.product.stock) {
            increased = true;
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }
        }
        return item;
      }),
    );

    return increased;
  }

  decrease(productId: number): void {
    this.cartItems.update((items) =>
      items.map((item) => {
        if (item.product.id === productId) {
          // Quantity never goes below 1
          const newQty = Math.max(1, item.quantity - 1);
          return {
            ...item,
            quantity: newQty,
          };
        }
        return item;
      }),
    );
  }

  removeFromCart(productId: number): void {
    this.cartItems.update((items) => items.filter((item) => item.product.id !== productId));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  getItem(productId: number): CartItem | undefined {
    return this.cartItems().find((item) => item.product.id === productId);
  }

  private loadCartFromStorage(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const sanitized: CartItem[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item === 'object' &&
          item.product &&
          typeof item.product.id === 'number' &&
          typeof item.product.price === 'number'
        ) {
          const stock = typeof item.product.stock === 'number' ? item.product.stock : 999;
          const rawQuantity = typeof item.quantity === 'number' ? item.quantity : 1;
          const quantity = Math.max(1, Math.min(stock > 0 ? stock : 1, Math.floor(rawQuantity)));

          sanitized.push({
            product: item.product,
            quantity,
          });
        }
      }

      return sanitized;
    } catch {
      return [];
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {
      // Storage unavailable, quota exceeded, etc.
    }
  }
}
