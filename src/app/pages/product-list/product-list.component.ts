import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private allProductsSubject = new BehaviorSubject<Product[]>([]);
  paginatedProducts$: Observable<Product[]> | undefined;

  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();
  itemsPerPage = 5;
  totalPages = 0;

  selectedStatus: string | null = null;
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Product[]>('http://127.0.0.1:8000/products').subscribe((products) => {
      this.allProductsSubject.next(products);
      this.calculateTotalPages(products.length);
    });

    this.paginatedProducts$ = combineLatest([
      this.allProductsSubject.asObservable(),
      this.currentPageSubject.asObservable(),
    ]).pipe(
      map(([products, currentPage]) => {
        let filteredProducts = products;

        if (this.selectedStatus !== null) {
          const inStock = this.selectedStatus === 'In Stock';
          filteredProducts = filteredProducts.filter((p) => p.inStock === inStock);
        }

        if (this.searchTerm.trim().length > 0) {
          const lowerSearch = this.searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(lowerSearch) ||
              p.category.toLowerCase().includes(lowerSearch)
          );
        }

        this.calculateTotalPages(filteredProducts.length);

        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );
  }

  private calculateTotalPages(totalItems: number): void {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (this.currentPageSubject.getValue() > this.totalPages && this.totalPages > 0) {
      this.currentPageSubject.next(this.totalPages);
    } else if (this.totalPages === 0 && this.currentPageSubject.getValue() !== 1) {
      this.currentPageSubject.next(1);
    }
  }

  setStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.currentPageSubject.next(1);
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.currentPageSubject.next(1);
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }

  getProductAvailability(inStock: boolean): string {
    return inStock ? 'In Stock' : 'Out of Stock';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageSubject.next(page);
    }
  }

  nextPage(): void {
    if (this.currentPageSubject.getValue() < this.totalPages) {
      this.currentPageSubject.next(this.currentPageSubject.getValue() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPageSubject.getValue() > 1) {
      this.currentPageSubject.next(this.currentPageSubject.getValue() - 1);
    }
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  navigateToEdit(name: string): void {
    this.router.navigate(['/dynamic-form'], { queryParams: { name } });
  }
}
