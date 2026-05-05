import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addons } from '../../services/addons';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class Ranking implements OnInit {
  private addonsService = inject(Addons);
  private cdr = inject(ChangeDetectorRef);
  ranking: any[] = [];
  loading = true;

  ngOnInit() {
    this.addonsService.getRanking().subscribe({
      next: (data) => {
        this.ranking = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el ranking:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDescargas(descargas: number): string {
    if (descargas >= 1000000) {
      return (descargas / 1000000).toFixed(1) + ' M';
    } else if (descargas >= 1000) {
      return (descargas / 1000).toFixed(1) + ' K';
    }
    return descargas.toString();
  }
}
