import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

interface Product {
  _id?: string;
  name: string;
  desc: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  salePrice: number;
  inStock: boolean;
  quantity: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
})
export class ProductListComponent implements OnInit {
  paginatedProducts$: Observable<Product[]> = of([]);
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();
  itemsPerPage = 5;
  totalPages = 0;

  selectedStatus: string | null = null;
  searchTerm: string = '';

  private allProducts: Product[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(this.currentPageSubject.value);

    this.paginatedProducts$ = combineLatest([
      this.currentPage$,
    ]).pipe(
      switchMap(([page]) => this.fetchProductsFromServer(page)),
      map((products) => {
        this.allProducts = products;

        let filtered = [...products];
        if (this.selectedStatus !== null) {
          const inStock = this.selectedStatus === 'In Stock';
          filtered = filtered.filter((p) => p.inStock === inStock);
        }

        if (this.searchTerm.trim().length > 0) {
          const search = this.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              p.category.toLowerCase().includes(search)
          );
        }

        return filtered;
      })
    );
  }

  fetchProductsFromServer(page: number): Observable<Product[]> {
    const limit = this.itemsPerPage;
    const url = `http://127.0.0.1:8000/products?page=${page}&limit=${limit}`;
    return this.http.get<{ total: number; products: Product[] }>(url).pipe(
      map((res) => {
        this.totalPages = Math.ceil(res.total / this.itemsPerPage);
        return res.products;
      })
    );
  }

  loadPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageSubject.next(page);
    }
  }

  setStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.loadPage(1);
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.loadPage(1);
  }

  getProductAvailability(inStock: boolean): string {
    return inStock ? 'In Stock' : 'Out of Stock';
  }

  goToPage(page: number): void {
    this.loadPage(page);
  }

  nextPage(): void {
    const current = this.currentPageSubject.value;
    if (current < this.totalPages) this.loadPage(current + 1);
  }

  previousPage(): void {
    const current = this.currentPageSubject.value;
    if (current > 1) this.loadPage(current - 1);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  navigateToEdit(name: string): void {
    this.router.navigate(['/dynamic-form'], { queryParams: { name } });
  }
}
