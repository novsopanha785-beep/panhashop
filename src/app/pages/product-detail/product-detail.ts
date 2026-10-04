import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { FALLBACK_IMAGE, handleImageError } from '../../utils/image';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  private feedbackTimeout?: ReturnType<typeof setTimeout>;

  readonly onImageError = handleImageError;

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'warning'>('success');

  ngOnInit(): void {
    // switchMap cancels the previous request if the id changes while a
    // product is still loading, so a slow response can never overwrite a
    // newer one.
    this.route.paramMap
      .pipe(
        tap(() => this.resetState()),
        switchMap((params) => {
          const id = Number(params.get('id'));

          if (!Number.isInteger(id) || id <= 0) {
            this.fail();
            return EMPTY;
          }

          return this.productService.getProduct(id).pipe(
            catchError(() => {
              this.fail();
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((product) => {
        this.product.set(product);
        this.selectedImage.set(product.thumbnail || product.images?.[0] || FALLBACK_IMAGE);
        this.titleService.setTitle(`${product.title} | PANHASHOP`);
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
  }

  selectImage(image: string): void {
    if (image) {
      this.selectedImage.set(image);
    }
  }

  addToCart(): void {
    const item = this.product();
    if (!item || item.stock <= 0) {
      return;
    }

    const currentInCart = this.cartService.getItem(item.id);
    if (currentInCart && currentInCart.quantity >= item.stock) {
      this.showFeedback('Maximum available stock already in cart', 'warning');
      return;
    }

    const success = this.cartService.addToCart(item);
    if (success) {
      this.showFeedback('Added to cart successfully!', 'success');
    } else {
      this.showFeedback('Unable to add item to cart', 'warning');
    }
  }

  /**
   * "Buy now" makes sure the product is in the cart and jumps to checkout.
   * If it is already there it is NOT added again, so repeated clicks (or
   * coming back later) never silently increase the quantity.
   */
  buyNow(): void {
    const item = this.product();
    if (!item || item.stock <= 0) {
      return;
    }

    if (!this.cartService.getItem(item.id)) {
      this.cartService.addToCart(item);
    }

    this.router.navigate(['/checkout']);
  }

  private resetState(): void {
    this.loading.set(true);
    this.error.set(false);
    this.product.set(null);
    this.selectedImage.set('');
    this.feedbackMessage.set('');
  }

  private fail(): void {
    this.product.set(null);
    this.selectedImage.set('');
    this.loading.set(false);
    this.error.set(true);
    this.titleService.setTitle('Product not found | PANHASHOP');
  }

  private showFeedback(message: string, type: 'success' | 'warning'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackTimeout = setTimeout(() => {
      this.feedbackMessage.set('');
    }, 3500);
  }
}
