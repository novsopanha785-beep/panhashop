import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Product, ProductQueryParams, ProductResponse, ProductSort } from '../models/product';
import { environment } from '../../environments/environment';

/** Maps the UI sort options to DummyJSON's `sortBy` / `order` parameters. */
const SORT_OPTIONS: Record<ProductSort, { sortBy: string; order: 'asc' | 'desc' } | null> = {
  default: null,
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating-desc': { sortBy: 'rating', order: 'desc' },
  'title-asc': { sortBy: 'title', order: 'asc' },
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProducts(params?: ProductQueryParams): Observable<ProductResponse> {
    const limit = params?.limit ?? 30;
    const skip = params?.skip ?? 0;
    const search = params?.search?.trim();
    const category = params?.category?.trim();
    const sort = SORT_OPTIONS[params?.sort ?? 'default'];

    let url = this.apiUrl;
    let httpParams = new HttpParams().set('limit', limit.toString()).set('skip', skip.toString());

    // DummyJSON does not provide a single endpoint for
    // "search inside a category". When both filters are active,
    // load the selected category, filter it locally, then paginate
    // the filtered result so the total/count stays correct.
    if (category && category.toLowerCase() !== 'all' && search) {
      const categoryUrl = `${this.apiUrl}/category/${encodeURIComponent(category)}`;

      return this.http
        .get<ProductResponse>(categoryUrl, {
          params: this.withSort(new HttpParams().set('limit', '0'), sort),
        })
        .pipe(
          map((response) => {
            const query = search.toLowerCase();

            const filtered = response.products.filter((product) => {
              const searchableText = [
                product.title,
                product.description,
                product.brand ?? '',
                product.category,
              ]
                .join(' ')
                .toLowerCase();

              return searchableText.includes(query);
            });

            const paginated = filtered.slice(skip, skip + limit);

            return {
              products: paginated,
              total: filtered.length,
              skip,
              limit,
            };
          }),
          catchError((error) => {
            console.error('Failed to fetch products:', error);
            return throwError(() => error);
          }),
        );
    }

    if (category && category.toLowerCase() !== 'all') {
      url = `${this.apiUrl}/category/${encodeURIComponent(category)}`;
    } else if (search) {
      url = `${this.apiUrl}/search`;
      httpParams = httpParams.set('q', search);
    }

    httpParams = this.withSort(httpParams, sort);

    return this.http.get<ProductResponse>(url, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Failed to fetch products:', error);
        return throwError(() => error);
      }),
    );
  }

  private withSort(
    httpParams: HttpParams,
    sort: { sortBy: string; order: 'asc' | 'desc' } | null,
  ): HttpParams {
    return sort ? httpParams.set('sortBy', sort.sortBy).set('order', sort.order) : httpParams;
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to fetch product with id ${id}:`, error);
        return throwError(() => error);
      }),
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/category-list`).pipe(
      catchError((error) => {
        console.error('Failed to fetch categories:', error);
        return throwError(() => error);
      }),
    );
  }
}
