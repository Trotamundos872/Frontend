import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Addons as AddonsService } from "../../services/addons";
import { Addon } from "../../models/addon.model"
import { RouterModule } from '@angular/router';
import { of, Subscription, Subject } from 'rxjs';
import { catchError, retry, timeout, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-addons',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule],
  templateUrl: './addons.html',
  styleUrls: ['./addons.css'],
})
export class Addons implements OnInit, OnDestroy {
  valores: Addon[] = [];
  loading = true;
  errorLoading = false;
  searchTerm = '';
  private searchSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private addonsService: AddonsService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAddons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadAddons(this.searchTerm);
  }

  loadAddons(termino: string = ''): void {
    this.loading = true;
    this.errorLoading = false;

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.searchSubscription = this.addonsService.getAll(termino).pipe(
      timeout(8000), // Si el servidor tarda más de 8s, lanza error y quita el Cargando...
      retry({ count: 1, delay: 1000 }),
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('No se pudo obtener addons', err);
        this.errorLoading = true;
        this.loading = false;
        this.cdr.detectChanges();
        return of([] as Addon[]);
      })
    ).subscribe({
      next: data => {
        this.valores = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorLoading = true;
        this.cdr.detectChanges();
      }
    });
  }
}
