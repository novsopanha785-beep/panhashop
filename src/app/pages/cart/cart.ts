import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

import { CartService } from '../../services/cart.service';
import { handleImageError } from '../../utils/image';

@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartService = inject(CartService);

  readonly onImageError = handleImageError;

  increase(id: number): void {
    this.cartService.increase(id);
  }

  decrease(id: number): void {
    this.cartService.decrease(id);
  }

  remove(id: number): void {
    this.cartService.removeFromCart(id);
  }

  clear(): void {
    this.cartService.clearCart();
  }
}
