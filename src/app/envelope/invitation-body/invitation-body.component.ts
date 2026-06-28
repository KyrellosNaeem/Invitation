import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GuestEntry {
  name: string;
  message: string;
  showReception: boolean;
}

interface InvitationConfig {
  guests: { [code: string]: GuestEntry };
  default: GuestEntry;
  receptionDefault: GuestEntry;
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
  // URL params from envelope
  @Input() guestCode      = '';   // ?code=K001
  @Input() receptionParam = '';   // ?r=ksar  → forces showReception=true with default message

  // Emits resolved guest name back to envelope (for flap display)
  @Output() guestNameResolved = new EventEmitter<string>();

  // Resolved values
  guestName      = 'Friend';
  customMessage  = '';
  showReception  = false;
  hasCode        = false;  // true when a valid ?code= was provided → hides signature field

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
  rsvpName       = '';
  rsvpMessage    = '';
  rsvpAttending: 'yes' | 'no' | null = null;
  rsvpSubmitted  = false;
  rsvpSubmitting = false;
  rsvpError      = false;

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
        this.resolveGuest(config);
        setTimeout(() => this.setupFadeIn(), 50);
      },
      error: () => {
        // Fallback if JSON fails
        this.guestName     = 'Friend';
        this.customMessage = 'We joyfully invite you to share in the celebration of our wedding day.';
        this.showReception = this.receptionParam === 'ksar';
        this.hasCode       = false;
        this.rsvpName      = this.guestName;
        this.guestNameResolved.emit(this.guestName);
        setTimeout(() => this.setupFadeIn(), 50);
      }
    });
  }

  private resolveGuest(config: InvitationConfig): void {
    const code = this.guestCode.trim();
    const r    = this.receptionParam.trim().toLowerCase();

    if (code && config.guests[code]) {
      // ── Valid code: use that guest's entry ──
      const entry        = config.guests[code];
      this.guestName     = entry.name;
      this.customMessage = entry.message;
      this.showReception = entry.showReception;
      this.hasCode       = true;
      this.rsvpName      = entry.name; // pre-fill & hide signature field
    } else if (r === 'ksar') {
      // ── ?r=ksar: default message but reception forced ON ──
      const entry        = config.receptionDefault;
      this.guestName     = entry.name;
      this.customMessage = entry.message;
      this.showReception = true;
      this.hasCode       = false;
    } else {
      // ── No params: plain default, no reception ──
      const entry        = config.default;
      this.guestName     = entry.name;
      this.customMessage = entry.message;
      this.showReception = entry.showReception;
      this.hasCode       = false;
    }

    if(this.customMessage.trim() === '') {
      this.customMessage = config.default.message;
    }

    this.guestNameResolved.emit(this.guestName);
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
  submitRsvp(): void {
    if (!this.rsvpName.trim() || !this.rsvpAttending) return;

    this.rsvpSubmitting = true;
    this.rsvpError      = false;

    const payload = {
      name:      this.rsvpName.trim(),
      attending: this.rsvpAttending,
      message:   this.rsvpMessage.trim(),
      code:      this.guestCode || null
    };

    this.http.post('https://wedding-rsvp-six-inky.vercel.app/api/rsvp', payload).subscribe({
      next: () => {
        this.rsvpSubmitted  = true;
        this.rsvpSubmitting = false;
      },
      error: () => {
        this.rsvpError      = true;
        this.rsvpSubmitting = false;
      }
    });
  }
}