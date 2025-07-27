// activity.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface Activity {
  _id: string;
  name: string;
  action: string;
  timestamp: string;
  details: string;
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  // You need to add CommonModule and HttpClientModule to your imports for standalone components
  // or import them in your AppModule if you're using NgModules.
  // Assuming a standalone component setup for simplicity here.
  // If you are using an NgModule, ensure HttpClientModule is imported in your AppModule
  // and CommonModule is imported in the module where ActivityComponent is declared.
  standalone: true, // Mark as standalone if not already
  imports: [CommonModule,NavbarComponent], // Add CommonModule here
})
export class ActivityComponent implements OnInit {
  activities: Activity[] = [];
  private apiUrl = 'http://127.0.0.1:8000/users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities(): void {
    this.http.get<Activity[]>(this.apiUrl).subscribe(
      (data) => {
        this.activities = data.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp).toLocaleString() // Format the timestamp
        }));
      },
      (error) => {
        console.error('Error fetching activities:', error);
      }
    );
  }
}