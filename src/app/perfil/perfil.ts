import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Addons } from "../services/addons";
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

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
  loading = true;

  constructor(private route: ActivatedRoute, private addonsService: Addons, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        //Si No ha cargado
        if (!id) {
          this.loading = false;
          this.info = null;
          this.cdr.detectChanges();
          return of(null);
        }
        this.loading = true;
        return this.addonsService.getCreadorById(id).pipe(
          tap(data => {
            if (data) {
              this.info = {
                nombre: data.nombre,
                especialidad: data.especialidad
              };
            } else {
              this.info = null;
            }
            this.loading = false;
            this.cdr.detectChanges();
          }),

          //Si el creador NO existe (esto se sabe por como lanzamo el error)
          catchError(err => {
            console.error('Error al cargar perfil:', err);
            this.info = null;
            this.loading = false;
            this.cdr.detectChanges();
            return of(null);
          })
        );
      })
    ).subscribe();
  }
}
