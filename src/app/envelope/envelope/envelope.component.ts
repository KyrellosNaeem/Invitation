import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvitationBodyComponent } from '../invitation-body/invitation-body.component';
import { first } from 'rxjs/internal/operators/first';

@Component({
  selector: 'app-envelope',
  standalone: true,
  imports: [CommonModule, InvitationBodyComponent],
  templateUrl: './envelope.component.html',
  styleUrl: './envelope.component.css'
})
export class EnvelopeComponent implements OnInit {
  isOpen = false;
  scrollOffset = 0;
  guestName = 'Dear Friend';
  showInvitation = false;

  constructor(private route: ActivatedRoute, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['guest']) {
        this.guestName = decodeURIComponent(params['guest']);
      }
    });
  }

  ngAfterViewInit() {
  this.ngZone.onStable.pipe(first()).subscribe(() => {
    this.showInvitation = true;
  });
}

  toggleEnvelope(): void {
    if (this.scrollOffset < 1) {
      this.isOpen = !this.isOpen;
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.isOpen) {
      this.scrollOffset = target.scrollTop;
    }
  }
}
