import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cart } from './cart';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartService: CartService;

  const mockProduct: Product = {
    id: 1,
    title: 'Cart Item',
    description: 'Desc',
    category: 'beauty',
    price: 25,
    discountPercentage: 0,
    rating: 4.5,
    stock: 5,
    thumbnail: 'https://dummyjson.com/img.jpg',
    images: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    cartService = TestBed.inject(CartService);
    cartService.clearCart();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect cart operations', () => {
    cartService.addToCart(mockProduct);
    expect(cartService.cartCount()).toBe(1);

    component.increase(mockProduct.id);
    expect(cartService.cartCount()).toBe(2);

    component.decrease(mockProduct.id);
    expect(cartService.cartCount()).toBe(1);

    component.remove(mockProduct.id);
    expect(cartService.cartCount()).toBe(0);
  });
});
