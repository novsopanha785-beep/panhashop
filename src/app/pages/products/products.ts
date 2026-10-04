import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  inject,
  signal,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';
import { Product, ProductSort } from '../../models/product';
import { ProductCard } from '../../components/product-card/product-card';

interface ProductQuery {
  page: number;
  category: string;
  search: string;
  sort: ProductSort;
}

const DEFAULT_QUERY: ProductQuery = {
  page: 1,
  category: 'all',
  search: '',
  sort: 'default',
};

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly sortOptions: { value: ProductSort; label: string }[] = [
    { value: 'default', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Top Rated' },
    { value: 'title-asc', label: 'Name: A–Z' },
  ];

  // Products & pagination
  products = signal<Product[]>([]);
  totalProducts = signal<number>(0);
  pageSize = signal<number>(12);
  currentPage = signal<number>(1);

  // Categories, search & sort
  categories = signal<string[]>([]);
  selectedCategory = signal<string>('all');
  searchTerm = signal<string>('');
  sortBy = signal<ProductSort>('default');

  // States
  loading = signal<boolean>(true);
  loadingCategories = signal<boolean>(true);
  error = signal<boolean>(false);

  /**
   * True only until the very first product list has loaded. Used to show the
   * full skeleton grid just once — after that, changing category/sort/search
   * keeps the current products on screen (dimmed) instead of blanking the
   * whole grid, so filtering feels smooth instead of jumpy.
   */
  hasLoadedOnce = signal<boolean>(false);

  /** Subject for explicit triggers (page/category/sort change, retry). */
  private queryTrigger = new BehaviorSubject<ProductQuery>(this.queryFromRoute());

  /** Subject that receives raw keystrokes from the search input. */
  private searchSubject = new Subject<string>();

  totalPages = computed(() => {
    const total = this.totalProducts();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  pagesList = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    const initial = this.queryTrigger.value;
    this.currentPage.set(initial.page);
    this.selectedCategory.set(initial.category);
    this.searchTerm.set(initial.search);
    this.sortBy.set(initial.sort);

    this.loadCategories();

    // Debounced search stream — emits a full ProductQuery when the user
    // stops typing. Resets page to 1 on every new search term.
    const search$ = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      map((query): ProductQuery => {
        this.searchTerm.set(query);
        this.currentPage.set(1);
        return this.currentQuery();
      }),
    );

    // Merge explicit triggers with the debounced search stream.
    // switchMap cancels in-flight HTTP requests when a newer query arrives.
    merge(this.queryTrigger, search$)
      .pipe(
        tap((query) => {
          this.loading.set(true);
          this.error.set(false);
          this.syncRoute(query);
        }),
        switchMap((q) => {
          const skip = (q.page - 1) * this.pageSize();
          return this.productService.getProducts({
            limit: this.pageSize(),
            skip,
            category: q.category !== 'all' ? q.category : undefined,
            search: q.search || undefined,
            sort: q.sort,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.products.set(response.products);
          this.totalProducts.set(response.total);
          this.loading.set(false);
          this.hasLoadedOnce.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.hasLoadedOnce.set(true);
          this.error.set(true);
        },
      });
  }

  loadCategories(): void {
    this.loadingCategories.set(true);
    this.productService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => {
          this.categories.set(cats);
          this.loadingCategories.set(false);
        },
        error: () => this.loadingCategories.set(false),
      });
  }

  /** Called by the template retry button and also serves as reload. */
  loadProducts(): void {
    this.emitQuery();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  selectCategory(category: string): void {
    if (this.selectedCategory() === category) {
      return;
    }
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.emitQuery();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProductSort;
    this.sortBy.set(value);
    this.currentPage.set(1);
    this.emitQuery();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.emitQuery();

      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.searchSubject.next('');
    this.emitQuery();
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.sortBy.set('default');
    this.currentPage.set(1);
    this.searchSubject.next('');
    this.emitQuery();
  }

  private currentQuery(): ProductQuery {
    return {
      page: this.currentPage(),
      category: this.selectedCategory(),
      search: this.searchTerm(),
      sort: this.sortBy(),
    };
  }

  private emitQuery(): void {
    this.queryTrigger.next(this.currentQuery());
  }

  /** Reads page/category/search/sort from the URL so a link can be shared or bookmarked. */
  private queryFromRoute(): ProductQuery {
    const params = this.route.snapshot.queryParamMap;
    const page = Number(params.get('page'));
    const validSorts: ProductSort[] = [
      'default',
      'price-asc',
      'price-desc',
      'rating-desc',
      'title-asc',
    ];
    const sortParam = params.get('sort') as ProductSort | null;

    return {
      page: Number.isInteger(page) && page > 0 ? page : DEFAULT_QUERY.page,
      category: params.get('category') ?? DEFAULT_QUERY.category,
      search: params.get('q') ?? DEFAULT_QUERY.search,
      sort: sortParam && validSorts.includes(sortParam) ? sortParam : DEFAULT_QUERY.sort,
    };
  }

  /** Keeps the URL in sync so filters survive a refresh or a shared link. */
  private syncRoute(query: ProductQuery): void {
    if (!this.isBrowser) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: query.page > 1 ? query.page : null,
        category: query.category !== 'all' ? query.category : null,
        q: query.search || null,
        sort: query.sort !== 'default' ? query.sort : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
