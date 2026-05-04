import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Addons } from "../services/addons";
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { Addon } from '../models/addon.model';

interface PerfilData {
  "nombre": string;
  "especialidad": string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule],
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

  public toggleSub() {
    this.subLoading = true;
    this.addonsService.toggleSubscripcion(Number(this.id)).subscribe({
      next: (res) => {
        // El endpoint devuelve el objeto suscripcion si se crea, o un mensaje si se borra
        // pero podemos simplemente volver a checkear el estado o alternarlo localmente
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
}
