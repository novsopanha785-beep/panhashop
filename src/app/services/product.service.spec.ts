import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products with default pagination', () => {
    const mockResponse = {
      products: [],
      total: 0,
      skip: 0,
      limit: 30,
    };

    service.getProducts().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('https://dummyjson.com/products?limit=30&skip=0');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch products with category filter', () => {
    const mockResponse = {
      products: [],
      total: 0,
      skip: 0,
      limit: 12,
    };

    service.getProducts({ category: 'beauty', limit: 12, skip: 0 }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      'https://dummyjson.com/products/category/beauty?limit=12&skip=0',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch products with search query', () => {
    const mockResponse = {
      products: [],
      total: 0,
      skip: 0,
      limit: 12,
    };

    service.getProducts({ search: 'phone', limit: 12, skip: 0 }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      'https://dummyjson.com/products/search?limit=12&skip=0&q=phone',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch single product by id', () => {
    const mockProduct = {
      id: 5,
      title: 'Phone',
      description: 'Desc',
      category: 'smartphones',
      price: 500,
      discountPercentage: 5,
      rating: 4.8,
      stock: 10,
      thumbnail: 'thumb.jpg',
      images: [],
    };

    service.getProduct(5).subscribe((res) => {
      expect(res).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne('https://dummyjson.com/products/5');
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should fetch categories list', () => {
    const mockCategories = ['beauty', 'fragrances', 'furniture'];

    service.getCategories().subscribe((res) => {
      expect(res).toEqual(mockCategories);
    });

    const req = httpTestingController.expectOne('https://dummyjson.com/products/category-list');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });
});
