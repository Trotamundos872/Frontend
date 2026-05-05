import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addons } from '../../services/addons';
import { RouterModule } from '@angular/router';

interface AddonData {
  id?: number;
  descripcion?: string;
  likes?: number;
  nombre?: string;
  tipo?: string;
  textoAddon?: string;
  urlMiniatura?: string;
  nombresCreadores?: string[];
}


@Component({
  selector: 'app-mis-creaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-creaciones.html',
  styleUrl: './mis-creaciones.css',
})
export class MisCreaciones implements OnInit {
  addonsService = inject(Addons);
  cdr = inject(ChangeDetectorRef);

  valores: AddonData[] = [];
  invitaciones: AddonData[] = [];
  loading = true;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.addonsService.getMisCreaciones().subscribe({
      next: (res) => {
        this.valores = res;
        this.cargarInvitaciones();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarInvitaciones() {
    this.addonsService.getInvitacionesPendientes().subscribe({
      next: (res) => {
        this.invitaciones = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aceptar(id: number) {
    this.addonsService.aceptarInvitacion(id).subscribe(() => {
      this.cargarDatos();
    });
  }

  rechazar(id: number) {
    this.addonsService.rechazarInvitacion(id).subscribe(() => {
      this.cargarDatos();
    });
  }
}
