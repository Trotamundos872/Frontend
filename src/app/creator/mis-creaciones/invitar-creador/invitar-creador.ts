import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Addons } from '../../../services/addons';

@Component({
  selector: 'app-invitar-creador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invitar-creador.html',
  styleUrl: './invitar-creador.css'
})
export class InvitarCreador implements OnInit {
  private addonsService = inject(Addons);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  idAddon: number | null = null;
  creadores: any[] = [];
  creadoresStatus: Map<number, string> = new Map();
  loading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idAddon = +id;
      this.verificarPermisos();
    } else {
      this.router.navigate(['/creator/mis-creaciones']);
    }
  }

  verificarPermisos() {

    this.addonsService.getAddonById(this.idAddon!.toString()).subscribe({
      next: (addon) => {
        // Si somos el creador original, cargamos los datos
        this.cargarDatos();
      },
      error: () => this.router.navigate(['/creator/mis-creaciones'])
    });
  }

  cargarDatos() {
    this.loading = true;
    this.cdr.detectChanges();

    // Cargamos todos los creadores y el estado de los que ya están en el addon
    this.addonsService.getAllCreadores().subscribe({
      next: (todos: any) => {
        this.creadores = todos;
        this.cargarEstados();
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar los creadores.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarEstados() {
    this.addonsService.getCreadoresDeUnAddon(this.idAddon!).subscribe({
      next: (colaboradores: any[]) => {
        this.creadoresStatus.clear();
        colaboradores.forEach(c => {
          this.creadoresStatus.set(c.id, c.status);
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatus(idCreador: number): string {
    return this.creadoresStatus.get(idCreador) || 'ninguno';
  }

  invitar(idCreador: number) {
    if (!this.idAddon) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.addonsService.invitarCreador(this.idAddon, idCreador).subscribe({
      next: (res: any) => {
        this.successMessage = '¡Invitación enviada correctamente!';
        this.cargarEstados();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Error al enviar la invitación.';
        this.cdr.detectChanges();
      }
    });
  }

  denegar(idCreador: number) {
    if (!this.idAddon) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.addonsService.denegarAcceso(this.idAddon, idCreador).subscribe({
      next: (res: any) => {
        this.successMessage = 'Acceso denegado correctamente.';
        this.cargarEstados();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Error al denegar el acceso.';
        this.cdr.detectChanges();
      }
    });
  }
}
