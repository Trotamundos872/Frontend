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
  loading = true;

  ngOnInit() {
    this.addonsService.getMisCreaciones().subscribe({
      next: (res) => {
        this.valores = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
