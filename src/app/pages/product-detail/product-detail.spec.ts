import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;
  let cartService: CartService;

  const mockProduct = {
    id: 1,
    title: 'Detail Test Product',
    description: 'Detailed description',
    category: 'beauty',
    price: 49.99,
    discountPercentage: 10,
    rating: 4.7,
    stock: 5,
    thumbnail: 'https://dummyjson.com/img.jpg',
    images: ['https://dummyjson.com/img1.jpg', 'https://dummyjson.com/img2.jpg'],
  };

  const mockProductService = {
    getProduct: (id: number) => of(mockProduct),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    cartService = TestBed.inject(CartService);
    cartService.clearCart();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    expect(component.product()?.title).toBe('Detail Test Product');
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(false);
  });

  it('should add product to cart and show feedback', () => {
    component.addToCart();
    expect(cartService.cartCount()).toBe(1);
    expect(component.feedbackMessage()).toBe('Added to cart successfully!');
  });
});
