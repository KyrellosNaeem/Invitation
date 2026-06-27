import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GuestEntry {
  message: string;
}

interface InvitationConfig {
  showReception: boolean;
  guests: { [key: string]: GuestEntry };
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-invitation-body',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitation-body.component.html',
  styleUrl: './invitation-body.component.css'
})
export class InvitationBodyComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() guestName: string = 'Dear Friend';

  customMessage = '';
  showReception = false;

  // ── CALENDAR ──
  readonly weddingDay   = 19;
  readonly weddingMonth = 6;
  readonly weddingYear  = 2026;
  readonly dayLabels    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendarDays: (number | null)[] = [];

  // ── COUNTDOWN ──
  countdown: CountdownTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownInterval: any;

  // ── RSVP ──
  rsvpName        = '';
  rsvpMessage     = '';
  rsvpAttending: 'yes' | 'no' | null = null;
  rsvpSubmitted   = false;
  rsvpError       = false;

  // ── INTERSECTION OBSERVER ──
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private el: ElementRef) {}

  ngOnInit(): void {
    this.buildCalendar();
    this.loadConfig();
    this.startCountdown();
  }

  ngAfterViewInit(): void {
    this.setupFadeIn();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
    if (this.observer) this.observer.disconnect();
  }

  // ── CONFIG ──
  private loadConfig(): void {
    this.http.get<InvitationConfig>('assets/invitation-config.json').subscribe({
      next: (config) => {
        this.showReception = config.showReception;
        const key   = this.guestName.toLowerCase().trim();
        const entry = config.guests[key] ?? config.guests['default'];
        this.customMessage = entry?.message ?? '';
        // Re-observe after *ngIf sections are rendered in the DOM
        setTimeout(() => this.setupFadeIn(), 50);
      },
      error: () => {
        this.customMessage = 'We joyfully invite you to share in the celebration of our wedding day.';
        this.showReception = true;
        setTimeout(() => this.setupFadeIn(), 50);
      }
    });
  }

  // ── CALENDAR ──
  private buildCalendar(): void {
    const firstDay    = new Date(this.weddingYear, this.weddingMonth, 1).getDay();
    const offset      = (firstDay + 6) % 7;
    const daysInMonth = new Date(this.weddingYear, this.weddingMonth + 1, 0).getDate();

    this.calendarDays = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
  }

  addToCalendar(): void {
    const start = `${this.weddingYear}0719T180000`;
    const end   = `${this.weddingYear}0719T230000`;
    const url = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `&text=${encodeURIComponent('Kyrillos & Selvana Wedding')}`,
      `&dates=${start}/${end}`,
      `&details=${encodeURIComponent('Join us in celebrating the wedding of Kyrillos & Selvana')}`,
      `&location=${encodeURIComponent('St Mark and St Peter Church, Alexandria, Egypt')}`
    ].join('');
    window.open(url, '_blank');
  }

  // ── COUNTDOWN ──
  private startCountdown(): void {
    const target = new Date(this.weddingYear, this.weddingMonth, this.weddingDay, 18, 0, 0);

    const tick = () => {
      const now  = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        clearInterval(this.countdownInterval);
        return;
      }

      this.countdown = {
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }

  // ── FADE-IN ON SCROLL ──
  private setupFadeIn(): void {
    const sections = this.el.nativeElement.querySelectorAll('.fade-section');

    // Disconnect previous observer before creating a new one
    if (this.observer) this.observer.disconnect();

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    sections.forEach((s: Element) => this.observer.observe(s));
  }

  // ── RSVP ──
  submitRsvp(): void {return;
    if (!this.rsvpName.trim() || !this.rsvpAttending) return;

    const line = [
      `Guest: ${this.rsvpName.trim()}`,
      `Attending Reception: ${this.rsvpAttending === 'yes' ? 'Yes' : 'No'}`,
      `Message: ${this.rsvpMessage.trim() || '—'}`,
      `Submitted: ${new Date().toLocaleString()}`,
      '---'
    ].join('\n');

    const blob = new Blob([line + '\n'], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `rsvp_${this.rsvpName.trim().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.rsvpSubmitted = true;
  }
}