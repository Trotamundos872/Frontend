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
  loading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idAddon = +id;
      this.cargarCreadores();
    } else {
      this.router.navigate(['/creator/mis-creaciones']);
    }
  }

  cargarCreadores() {
    this.loading = true;
    this.cdr.detectChanges();
    this.addonsService.getAllCreadores().subscribe({
      next: (data: any) => {
        this.creadores = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar los creadores.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  invitar(idCreador: number) {
    if (!this.idAddon) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.addonsService.invitarCreador(this.idAddon, idCreador).subscribe({
      next: (res: any) => {
        this.successMessage = '¡Invitación enviada correctamente!';
        this.cdr.detectChanges();
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
}
