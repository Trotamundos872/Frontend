import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Addons } from "../services/addons";
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { API_URL } from '../app.constants';

import { Addon } from '../models/addon.model';

interface PerfilData {
  "nombre": string;
  "especialidad": string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  id!: string;
  info: PerfilData | null = null;
  addons: Addon[] = [];
  loading = true;
  loadingAddons = true;
  subscrito = false;
  subLoading = false;

  // Reporte
  mostrarFormReporte = false;
  razonReporte = '';
  reportando = false;
  reporteExito = '';
  reporteError = '';

  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  constructor(private route: ActivatedRoute, private addonsService: Addons, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        this.cargarPerfil(id);
        this.cargarAddons(id);
        this.checkEstadoSub(id);
      } else {
        this.loading = false;
        this.loadingAddons = false;
        this.cdr.detectChanges();
      }
    });
  }

  private checkEstadoSub(id: string) {
    this.addonsService.getEstadoSubscripcion(Number(id)).subscribe({
      next: (res) => {
        this.subscrito = res.subscrito;
        this.cdr.detectChanges();
      }
    });
  }

  //subscribirte
  public toggleSub() {
    this.subLoading = true;
    this.addonsService.toggleSubscripcion(Number(this.id)).subscribe({
      next: (res) => {
        this.subscrito = !this.subscrito;
        this.subLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar suscripcion:', err);
        this.subLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarPerfil(id: string) {
    this.loading = true;
    this.addonsService.getCreadorById(id).subscribe({
      next: (data) => {
        if (data) {
          this.info = {
            nombre: data.nombre,
            especialidad: data.especialidad
          };
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.info = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarAddons(id: string) {
    this.loadingAddons = true;
    this.addonsService.getAddonsDeCreador(id).subscribe({
      next: (data) => {
        this.addons = data || [];
        this.loadingAddons = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar addons del creador:', err);
        this.addons = [];
        this.loadingAddons = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormReporte() {
    this.mostrarFormReporte = true;
    this.reporteExito = '';
    this.reporteError = '';
    this.razonReporte = '';
  }

  cancelarReporte() {
    this.mostrarFormReporte = false;
    this.razonReporte = '';
    this.reporteError = '';
  }

  enviarReporte() {
    if (!this.id) return;
    if (!this.razonReporte.trim()) {
      this.reporteError = 'Por favor, escribe el motivo del reporte.';
      return;
    }

    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwtToken') || '';
    }

    if (!token) {
      this.reporteError = 'Debes iniciar sesión para reportar.';
      return;
    }

    this.reportando = true;
    this.reporteError = '';

    this.http.post(`${this.apiUrl}/api/reporte`, {
      tipo: 'usuario',
      referenciaId: Number(this.id),
      razon: this.razonReporte.trim()
    }, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).subscribe({
      next: () => {
        this.reportando = false;
        this.mostrarFormReporte = false;
        this.reporteExito = '¡Reporte enviado! Gracias por ayudarnos a mejorar la plataforma.';
        this.razonReporte = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reportando = false;
        this.reporteError = err?.error?.error || 'Error al enviar el reporte. Inténtalo de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}
