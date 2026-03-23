import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<div class="page-header"><h1>Announcements</h1></div><mat-card><mat-card-content><p>Announcements management interface coming soon.</p></mat-card-content></mat-card>`
})
export class AnnouncementsComponent {}
