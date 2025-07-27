import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet

@Component({
  selector: 'app-root',
  // Remove individual component imports from 'imports' array if you are using routing
  // and these components will be loaded via the router-outlet.
  // If you still need them for other reasons (e.g., they are part of a shared module
  // or used elsewhere in the template outside of router-outlet), keep them.
  // For a typical routing setup, you would only need RouterOutlet here.
  imports: [RouterOutlet], // Only RouterOutlet is strictly needed for routing
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Frontend');
}