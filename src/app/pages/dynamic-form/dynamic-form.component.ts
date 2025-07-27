import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // ✅ Import Router
import widgetData from "../../../../public/schema.json";
import { NavbarComponent } from "../../components/navbar/navbar.component";

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  templateUrl: './dynamic-form.component.html',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, NavbarComponent]
})
export class DynamicFormComponent implements OnInit {
  form!: FormGroup;
  fields = widgetData;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router 
  ) {}

  ngOnInit() {
    const formGroupConfig: any = {};

    this.fields.forEach(field => {
      const validators = [];

      if (field.required) {
        if (field.type === 'checkbox') {
          validators.push(Validators.requiredTrue);
        } else {
          validators.push(Validators.required);
        }
      }

      if (field.min_length) {
        validators.push(Validators.minLength(field.min_length));
      }

      if (field.type === 'number') {
        validators.push(Validators.pattern('^[0-9]+(\\.[0-9]+)?$'));
        if (field.min !== undefined) {
          validators.push(Validators.min(field.min));
        }
      }

      if (field.type === 'checkbox') {
        formGroupConfig[field.name] = [false, validators];
      } else {
        formGroupConfig[field.name] = ['', validators];
      }
    });

    this.form = this.fb.group(formGroupConfig);
  }

  onSubmit() {
    if (this.form.valid) {
      const productName = this.form.value.name;

      this.http.get(`http://127.0.0.1:8000/products/${productName}`).subscribe({
        next: (existingProduct) => {
          // Product found - proceed to update
          this.http.put(`http://127.0.0.1:8000/products/${productName}`, this.form.value).subscribe({
            next: (response) => {
              console.log('Product updated:', response);
              alert('Product updated successfully.');
              this.resetForm();
              this.router.navigate(['/dashboard']); // ✅ Redirect after successful save
            },
            error: (error) => {
              console.error('Error updating product:', error);
              alert('Failed to update product.');
            }
          });
        },
        error: (error) => {
          if (error.status === 404) {
            alert('Product not found. Please create it first.');
          } else {
            console.error('Error checking product existence:', error);
            alert('An unexpected error occurred.');
          }
        }
      });
    } else {
      console.log('Form not valid');
      this.form.markAllAsTouched();
    }
  }

  resetForm() {
    const resetValues: any = {};
    this.fields.forEach(field => {
      if (field.type === 'checkbox') {
        resetValues[field.name] = false;
      } else {
        resetValues[field.name] = '';
      }
    });
    this.form.reset(resetValues);
  }
  onDelete() {
    const productName = this.form.value.name;
    if (!productName) {
      alert('Please enter a product name to delete.');
      return;
    }
  
    const confirmed = confirm(`Are you sure you want to delete product "${productName}"?`);
    if (!confirmed) return;
  
    this.http.delete(`http://127.0.0.1:8000/products/${productName}`).subscribe({
      next: (response) => {
        console.log('Product deleted:', response);
        alert('Product deleted successfully.');
        this.resetForm();
        this.router.navigate(['/dashboard']); // Optional: navigate after delete
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        if (error.status === 404) {
          alert('Product not found.');
        } else {
          alert('Failed to delete product.');
        }
      }
    });
  }
  
}
