import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { handleImageError } from '../../utils/image';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
  cartService = inject(CartService);

  readonly onImageError = handleImageError;

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.cartService.addToCart(this.product());
  }
}
