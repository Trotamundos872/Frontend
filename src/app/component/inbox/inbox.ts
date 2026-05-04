import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css'
})
export class Inbox {
  @Input() subscritos: any[] = [];
  @Input() loading = false;
}
