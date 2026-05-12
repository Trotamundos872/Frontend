import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addons } from '../../services/addons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  private addonsService = inject(Addons);
  private cdr = inject(ChangeDetectorRef);

  addonNames: string[] = [];
  filas: any[] = [];
  loading = true;

  ngOnInit() {
    this.cargarEstadisticas();
  }
  cargarEstadisticas() {
    this.loading = true;
    this.addonsService.getMisCreaciones().subscribe({
      next: (addons) => {
        if (!addons || addons.length === 0) {
          this.filas = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.addonNames = addons.map(a => a.nombre!).filter(n => !!n);
        const requests = addons.map(addon => {
          const id = addon.id;
          if (id === undefined) return of([]);
          return this.addonsService.getArchivosByAddon(id).pipe(
            catchError(err => {
              console.error(`Error cargando archivos para addon ${id}:`, err);
              return of([]);
            })
          );
        });

        forkJoin(requests).subscribe({
          next: (results: any[][]) => {
            const statsByDate: Map<string, any> = new Map();

            addons.forEach((addon, index) => {
              const archivos = results[index];
              if (archivos && archivos.length > 0) {
  
                const ultimaVersion = [...archivos].sort((a, b) => 
                  new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )[0];
                const dateObj = new Date(ultimaVersion.fecha);
                const fechaKey = dateObj.toDateString(); 
                if (!statsByDate.has(fechaKey)) {
                  statsByDate.set(fechaKey, { rawDate: dateObj });
                }
                
                const row = statsByDate.get(fechaKey);
                row[addon.nombre!] = ultimaVersion.numeroDescargas || 0;
              }
            });

     
            this.filas = Array.from(statsByDate.values()).sort((a, b) => 
              b.rawDate.getTime() - a.rawDate.getTime()
            );

            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error en forkJoin de estadísticas:', err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error cargando mis creaciones:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
