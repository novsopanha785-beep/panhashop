import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { CartService } from '../../services/cart.service';
import { Order, OrderCustomer } from '../../models/product';
import { handleImageError } from '../../utils/image';

@Component({
  selector: 'app-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnDestroy {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'shopora_last_order';
  private submitTimer?: ReturnType<typeof setTimeout>;

  cartService = inject(CartService);

  readonly onImageError = handleImageError;

  isSubmitting = signal(false);
  placedOrder = signal<Order | null>(this.loadOrderFromStorage());

  customer: OrderCustomer = {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
  };

  ngOnDestroy(): void {
    if (this.submitTimer) {
      clearTimeout(this.submitTimer);
    }

    // Once the shopper leaves the confirmation screen the order is "seen".
    // Clearing it prevents a stale confirmation from replacing the checkout
    // form the next time they buy something.
    if (this.placedOrder()) {
      this.saveOrderToStorage(null);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.cartService.isEmpty() || this.isSubmitting()) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    this.submitTimer = setTimeout(() => {
      const orderId =
        'SHP-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

      const total = this.cartService.cartTotal();

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date(),
        customer: { ...this.customer },
        items: [...this.cartService.items()],
        subtotal: total,
        shipping: 0,
        total,
      };

      this.saveOrderToStorage(newOrder);
      this.placedOrder.set(newOrder);
      this.cartService.clearCart();
      this.isSubmitting.set(false);
    }, 600);
  }

  /**
   * Restores the confirmation screen after a page refresh, but only when the
   * cart is empty. A non-empty cart means the shopper is starting a new order.
   */
  private loadOrderFromStorage(): Order | null {
    if (!this.isBrowser || !this.cartService.isEmpty()) {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as Order) : null;
    } catch {
      return null;
    }
  }

  private saveOrderToStorage(order: Order | null): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      if (order) {
        sessionStorage.setItem(this.storageKey, JSON.stringify(order));
      } else {
        sessionStorage.removeItem(this.storageKey);
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
}
