import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Products } from './products';
import { ProductService } from '../../services/product.service';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  const mockProductService = {
    getProducts: () =>
      of({
        products: [
          {
            id: 1,
            title: 'Product 1',
            description: 'Desc',
            category: 'beauty',
            price: 10,
            discountPercentage: 0,
            rating: 4,
            stock: 10,
            thumbnail: 'https://dummyjson.com/img.jpg',
            images: [],
          },
        ],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    getCategories: () => of(['beauty', 'fragrances']),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [provideRouter([]), { provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products and categories', () => {
    expect(component.products().length).toBe(1);
    expect(component.categories().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should mark hasLoadedOnce after the first response, success or error', () => {
    expect(component.hasLoadedOnce()).toBe(true);
  });
});
