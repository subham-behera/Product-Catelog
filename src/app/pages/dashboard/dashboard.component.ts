import { Component, OnInit } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor

interface Product {
    _id: {
        $oid: string;
    };
    productId: string;
    name: string;
    desc: string;
    category: string;
    brand: string;
    SKU: string;
    price: number;
    salePrice: number;
    inStock: boolean;
    quantity: number;
    imageUrl: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true, // Mark as standalone
    imports: [NavbarComponent, CommonModule], // Add CommonModule to imports
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
    totalProducts: number = 0;
    totalSales: number = 0;
    averageOrderValue: number = 0;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.fetchKeyMetrics();
    }

    fetchKeyMetrics(): void {
        this.http.get<Product[]>('http://127.0.0.1:8000/products').subscribe(
            (data: Product[]) => {
                this.totalProducts = data.length;

                // Calculate total sales and average order value
                let totalRevenue = 0;
                let totalOrders = 0; // Assuming each product in the list represents a potential "order" or sale item for simplicity, adjust based on actual data
                data.forEach(product => {
                    // For total sales, we'll assume salePrice if available, otherwise price, and multiply by quantity if it represents sold quantity
                    // If the endpoint just gives product catalog, you'd need actual order data to calculate sales accurately.
                    // For this example, let's assume total sales is sum of (salePrice * quantity) if quantity means "units sold".
                    // If quantity is "stock", then total sales calculation needs to be different.
                    // Let's assume for this mock, 'salePrice * 1' if it was sold, or if we want potential revenue:
                    totalRevenue += (product.salePrice > 0 ? product.salePrice : product.price) * product.quantity;
                    totalOrders += product.quantity; // A simplified way to count 'orders' or 'items sold'
                });
                
                this.totalSales = totalRevenue;

                // For Average Order Value, you'd typically need actual order data with order totals.
                // Here, we'll make a simplified calculation based on the given product data.
                // If totalOrders is 0 to prevent division by zero
                this.averageOrderValue = totalOrders > 0 ? this.totalSales / totalOrders : 0;
            },
            (error) => {
                console.error('Error fetching product data:', error);
                // Handle error (e.g., display an error message)
            }
        );
    }
}