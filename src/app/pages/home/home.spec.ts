import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Home } from './home';
import { ProductService } from '../../services/product.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  const mockProductService = {
    getProducts: () =>
      of({
        products: [
          {
            id: 1,
            title: 'Home Featured Product',
            description: 'Desc',
            category: 'beauty',
            price: 29.99,
            discountPercentage: 5,
            rating: 4.8,
            stock: 15,
            thumbnail: 'https://dummyjson.com/img.jpg',
            images: [],
          },
        ],
        total: 1,
        skip: 0,
        limit: 8,
      }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load featured products', () => {
    expect(component.products().length).toBe(1);
    expect(component.products()[0].title).toBe('Home Featured Product');
    expect(component.loading()).toBe(false);
  });
});
