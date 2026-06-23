import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnvelopeComponent } from './envelope/envelope/envelope.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EnvelopeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Invitation';
}
