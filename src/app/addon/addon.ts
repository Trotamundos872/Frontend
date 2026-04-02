import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Addons } from "../services/addons";
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

//Interfaz para definir la estructura de los datos del addon
interface AddonData {
  id?: number;
  descripcion?: string;
  likes?: number;
  nombre?: string;
  tipo?: string;
  urlMiniatura?: string;
}

@Component({
  selector: 'app-addon',
  imports: [CommonModule, NgbModule, RouterModule],
  templateUrl: './addon.html',
  styleUrl: './addon.css',
})
export class Addon implements OnInit {  
  id!: string;  
  valoresAddon: AddonData | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private addonsService: Addons) {}

ngOnInit() {
  this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      if (!id) {
        this.loading = false;
        this.valoresAddon = null;
        return of(null);
      }
      this.loading = true;
      return this.addonsService.getAddonById(id).pipe(
        tap(data => {
          this.valoresAddon = data ?? null;
          this.loading = false;
        }),
        catchError(err => {
          console.error('Error al cargar addon:', err);
          this.valoresAddon = null;
          this.loading = false;
          return of(null);
        })
      );
    })
  ).subscribe();
}
}
