import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product';

describe('CartService', () => {
  let service: CartService;

  const mockProduct1: Product = {
    id: 101,
    title: 'Product 101',
    description: 'Description 101',
    category: 'beauty',
    price: 20,
    discountPercentage: 0,
    rating: 4.5,
    stock: 3,
    thumbnail: 'thumb.jpg',
    images: [],
  };

  const mockProduct2: Product = {
    id: 102,
    title: 'Product 102',
    description: 'Description 102',
    category: 'groceries',
    price: 15,
    discountPercentage: 0,
    rating: 4.2,
    stock: 10,
    thumbnail: 'thumb2.jpg',
    images: [],
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
    service.clearCart();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add item to cart and calculate counts & totals', () => {
    const success = service.addToCart(mockProduct1);
    expect(success).toBe(true);
    expect(service.cartCount()).toBe(1);
    expect(service.cartTotal()).toBe(20);
    expect(service.isEmpty()).toBe(false);
  });

  it('should increase quantity when adding same item and respect stock limits', () => {
    service.addToCart(mockProduct1, 1);
    service.addToCart(mockProduct1, 1);
    expect(service.cartCount()).toBe(2);

    // Add up to stock limit of 3
    service.addToCart(mockProduct1, 1);
    expect(service.cartCount()).toBe(3);

    // Attempt to exceed stock limit (stock = 3)
    const exceedResult = service.addToCart(mockProduct1, 1);
    expect(exceedResult).toBe(false);
    expect(service.cartCount()).toBe(3);
  });

  it('should increase quantity via increase() only up to stock limit', () => {
    service.addToCart(mockProduct1, 2); // stock is 3
    const inc1 = service.increase(mockProduct1.id);
    expect(inc1).toBe(true);
    expect(service.getItem(mockProduct1.id)?.quantity).toBe(3);

    const inc2 = service.increase(mockProduct1.id);
    expect(inc2).toBe(false);
    expect(service.getItem(mockProduct1.id)?.quantity).toBe(3);
  });

  it('should decrease quantity but never go below 1', () => {
    service.addToCart(mockProduct1, 2);
    service.decrease(mockProduct1.id);
    expect(service.getItem(mockProduct1.id)?.quantity).toBe(1);

    // Decrease again at 1 should remain 1
    service.decrease(mockProduct1.id);
    expect(service.getItem(mockProduct1.id)?.quantity).toBe(1);
    expect(service.cartCount()).toBe(1);
  });

  it('should remove items correctly', () => {
    service.addToCart(mockProduct1, 1);
    service.addToCart(mockProduct2, 2);
    expect(service.cartCount()).toBe(3);

    service.removeFromCart(mockProduct1.id);
    expect(service.cartCount()).toBe(2);
    expect(service.getItem(mockProduct1.id)).toBeUndefined();
  });

  it('should clear cart correctly', () => {
    service.addToCart(mockProduct1, 1);
    service.addToCart(mockProduct2, 2);
    expect(service.isEmpty()).toBe(false);

    service.clearCart();
    expect(service.items().length).toBe(0);
    expect(service.cartCount()).toBe(0);
    expect(service.cartTotal()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should calculate multiple items total correctly', () => {
    service.addToCart(mockProduct1, 2); // 2 * 20 = 40
    service.addToCart(mockProduct2, 3); // 3 * 15 = 45
    expect(service.cartTotal()).toBe(85);
  });
});
