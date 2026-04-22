import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Addons } from "../../services/addons";
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface PerfilData {
  id: number;
  especialidad: string;
  usuario: {
    nombre: string;
    email: string;
  };
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, RouterModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})


export class MiPerfil implements OnInit {
  id!: string;
  info: PerfilData | null = null;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  formData = {
    nombre: '',
    especialidad: ''
  };

  private platformId = inject(PLATFORM_ID);

  constructor(private route: ActivatedRoute, private addonsService: Addons, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken");
    }

    if (!token) {
      this.loading = false;
      this.info = null;
      console.warn('No hay token de sesión.');
      return;
    }

    this.loading = true;
    this.addonsService.getCreadorByToken().pipe(
      tap(data => {
        console.log('Perfil recibido:', data);
        this.info = data ?? null;
        this.formData = {
          nombre: data?.usuario?.nombre ?? '',
          especialidad: data?.especialidad ?? ''
        };
        this.loading = false;
        this.cdr.detectChanges();
      }),
      catchError(err => {
        console.error('Error al cargar perfil:', err);
        this.info = null;
        this.loading = false;
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe();
  }

  guardarCambios() {
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.formData.nombre.trim();
    const especialidad = this.formData.especialidad.trim();

    if (nombre.length < 2 || nombre.length > 60) {
      this.errorMessage = 'El nombre debe tener entre 2 y 60 caracteres.';
      return;
    }

    if (!especialidad || especialidad.length > 60) {
      this.errorMessage = 'La especialidad es obligatoria y no puede superar los 60 caracteres.';
      return;
    }

    this.saving = true;
    this.addonsService.updateCreadorProfile({ nombre, especialidad }).subscribe({
      next: () => {
        if (this.info) {
          this.info.usuario.nombre = nombre;
          this.info.especialidad = especialidad;
        }
        this.formData = { nombre, especialidad };
        this.successMessage = 'Perfil actualizado correctamente.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'No se pudo guardar el perfil.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }


}
