import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Addons } from "../services/addons";
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { MarkdownPipe } from '../pipes/markdown.pipe';

//Interfaz para definir la estructura de los datos del addon
interface AddonData {
  id?: number;
  descripcion?: string;
  likes?: number;
  nombre?: string;
  tipo?: string;
  tag?: string;
  textoAddon?: string;
  urlMiniatura?: string;
  nombresCreadores?: string[];
  idsCreadores?: number[];
}

@Component({
  selector: 'app-addon',
  imports: [CommonModule, NgbModule, RouterModule, MarkdownPipe],
  templateUrl: './addon.html',
  styleUrl: './addon.css',
})
export class Addon implements OnInit {
  id!: string;
  valoresAddon: AddonData | null = null;
  archivos: any[] = [];
  loading = true;
  likeLoading = false;
  haDadoLike = false;

  constructor(private route: ActivatedRoute, private addonsService: Addons, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.loading = false;
          this.valoresAddon = null;
          this.cdr.detectChanges();
          return of(null);
        }
        this.loading = true;
        return this.addonsService.getAddonById(id).pipe(
          tap(data => {
            this.valoresAddon = data ?? null;
            if (this.valoresAddon?.id) {
              this.comprobarLike(this.valoresAddon.id);
              this.cargarArchivos(this.valoresAddon.id);
            }
            this.loading = false;
            this.cdr.detectChanges();
          }),
          catchError(err => {
            console.error('Error :', err);
            this.valoresAddon = null;
            this.loading = false;
            this.cdr.detectChanges();
            return of(null);
          })
        );
      })
    ).subscribe();
  }

  comprobarLike(addonId: number) {
    this.addonsService.comprobarLike(addonId).subscribe({
      next: (res) => {
        this.haDadoLike = res.haDadoLike;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error ', err);
        this.haDadoLike = false;
        this.cdr.detectChanges();
      }
    });
  }

  darLike() {
    if (!this.valoresAddon?.id || this.likeLoading) return;

    this.likeLoading = true;
    this.addonsService.darLike(this.valoresAddon.id).subscribe({
      next: (res) => {
        if (this.valoresAddon) {
          this.valoresAddon.likes = res.likes !== undefined ? res.likes : (this.valoresAddon.likes || 0);
          this.haDadoLike = !this.haDadoLike;
        }
        this.likeLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al dar like:', err);
        this.likeLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDownload(archivoId: number) {
    this.addonsService.registrarDescarga(archivoId).subscribe({
      next: () => {
        // Incrementamos localmente para feedback inmediato si fuera necesario
        const archivo = this.archivos.find(a => a.id === archivoId);
        if (archivo) {
          archivo.numeroDescargas = (archivo.numeroDescargas || 0) + 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al registrar descarga:', err)
    });
  }

  cargarArchivos(addonId: number) {
    this.addonsService.getArchivosByAddon(addonId).subscribe({
      next: (data) => {
        this.archivos = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando archivos:', err);
        this.archivos = [];
        this.cdr.detectChanges();
      }
    });
  }
}
