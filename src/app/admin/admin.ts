import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  // State
  reportes: any[] = [];
  loading = true;
  error = '';

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.cargarReportes();
  }

  private cargarReportes() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwtToken') ?? '';
    }
    if (!token) {
      this.error = 'No hay sesión activa';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.get<any[]>('http://localhost:8080/api/reporte', { headers })
      .subscribe({
        next: (data) => {
          this.reportes = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.error || 'Error al cargar reportes';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  eliminarReporte(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este reporte?')) return;

    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwtToken') ?? '';
    }

    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.delete(`http://localhost:8080/api/reporte/${id}`, { headers })
      .subscribe({
        next: () => {
          this.reportes = this.reportes.filter(r => r.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err?.error?.error || 'Error al eliminar el reporte');
          this.cdr.detectChanges();
        }
      });
  }

  deshabilitarEntidad(reporte: any) {
    if (!confirm(`¿Estás seguro de que deseas deshabilitar este ${reporte.tipo}?`)) return;

    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwtToken') ?? '';
    }

    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.post(`http://localhost:8080/api/reporte/deshabilitar/${reporte.id}`, {}, { headers })
      .subscribe({
        next: () => {
          alert('Entidad deshabilitada correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err?.error?.error || 'Error al deshabilitar la entidad');
          this.cdr.detectChanges();
        }
      });
  }
}
