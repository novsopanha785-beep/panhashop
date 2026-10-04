import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Checkout } from './checkout';
import { CartService } from '../../services/cart.service';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [provideRouter([])],
    }).compileComponents();

    const cartService = TestBed.inject(CartService);
    cartService.clearCart();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default customer data', () => {
    expect(component.customer.fullName).toBe('');
    expect(component.customer.paymentMethod).toBe('cod');
    expect(component.isSubmitting()).toBe(false);
    expect(component.placedOrder()).toBeNull();
  });

  it('should restore placed order from sessionStorage on init', () => {
    const mockOrder = {
      id: 'SHP-123456-789',
      createdAt: new Date(),
      customer: {
        fullName: 'Jane Doe',
        phone: '123456',
        email: 'jane@example.com',
        address: '123 St',
        city: 'City',
        paymentMethod: 'cod' as const,
      },
      items: [],
      subtotal: 50,
      shipping: 0,
      total: 50,
    };
    sessionStorage.setItem('shopora_last_order', JSON.stringify(mockOrder));

    const newFixture = TestBed.createComponent(Checkout);
    const newComponent = newFixture.componentInstance;
    expect(newComponent.placedOrder()?.id).toBe('SHP-123456-789');
  });
});
