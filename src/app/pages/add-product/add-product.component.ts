import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import widgetData from "../../../../public/schema.json";
import { NavbarComponent } from "../../components/navbar/navbar.component";

@Component({
    selector: 'app-add-product',
    standalone: true,
    templateUrl: './add-product.component.html',
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule,NavbarComponent]
})
export class AddProductComponent implements OnInit {
    form!: FormGroup;
    fields = widgetData;

    constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

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
          this.http.post('http://127.0.0.1:8000/products', this.form.value).subscribe({
            next: (response) => {
              console.log('Product created:', response);
              this.resetForm();
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              console.error('Error creating product:', error);
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
}
