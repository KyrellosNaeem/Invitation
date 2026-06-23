import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface GuestEntry {
  message: string;
}

interface InvitationConfig {
  showReception: boolean;
  guests: { [key: string]: GuestEntry };
}

@Component({
  selector: 'app-invitation-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-body.component.html',
  styleUrl: './invitation-body.component.css'
})
export class InvitationBodyComponent implements OnInit {
  @Input() guestName: string = 'Dear Friend';

  customMessage = '';
  showReception = false;

  readonly weddingDay = 19;
  readonly weddingMonth = 6; // July (0-indexed)
  readonly weddingYear = 2025;
  readonly dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendarDays: (number | null)[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buildCalendar();
    this.loadConfig();
  }

  private loadConfig(): void {
    this.http.get<InvitationConfig>('assets/invitation-config.json').subscribe({
      next: (config) => {
        this.showReception = config.showReception;
        const key = this.guestName.toLowerCase().trim();
        const entry = config.guests[key] ?? config.guests['default'];
        this.customMessage = entry?.message ?? '';
      },
      error: () => {
        this.customMessage = 'We joyfully invite you to share in the celebration of our wedding day.';
        this.showReception = true;
      }
    });
  }

  private buildCalendar(): void {
    const firstDay = new Date(this.weddingYear, this.weddingMonth, 1).getDay();
    const offset = (firstDay + 6) % 7; // shift Sun=0 → Mon=0
    const daysInMonth = new Date(this.weddingYear, this.weddingMonth + 1, 0).getDate();

    this.calendarDays = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
  }

  addToCalendar(): void {
    const start = `${this.weddingYear}0719T120000`;
    const end   = `${this.weddingYear}0719T230000`;
    const url = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `&text=${encodeURIComponent('Abanoub & Nour Wedding')}`,
      `&dates=${start}/${end}`,
      `&details=${encodeURIComponent('Join us in celebrating the wedding of Abanoub & Nour')}`,
      `&location=${encodeURIComponent('Church of St. Mary, Cairo, Egypt')}`
    ].join('');
    window.open(url, '_blank');
  }
}
