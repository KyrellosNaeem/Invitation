import { Routes } from '@angular/router';
import { EnvelopeComponent } from './envelope/envelope/envelope.component';

export const routes: Routes = [
  { path: '**', component: EnvelopeComponent }
];
