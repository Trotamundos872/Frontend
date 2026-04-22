import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Addons } from "../../services/addons";
import { Addon } from "../../models/addon.model"
import { RouterModule } from '@angular/router';
import { of, Subscription, Subject } from 'rxjs';
import { catchError, retry, timeout, takeUntil, tap } from 'rxjs/operators';

//Nota, hacer que home cargue todos, pero addons solo los del tipo addons

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  valores: Addon[] = [];
  loading = true;
  errorLoading = false;
  searchTerm = '';
  private searchSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private addons: Addons, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('Home: ngOnInit called');
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
    console.log('Home: loadAddons called with term:', termino);
    this.loading = true;
    this.errorLoading = false;

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    // Petición al servicio
    this.searchSubscription = this.addons.getAll(termino).pipe(
      tap(data => console.log('Home: Data received from service:', data?.length || 0, 'items')),
      retry({ count: 1, delay: 1000 }),
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Home: Error fetching addons:', err);
        this.errorLoading = true;
        this.loading = false;
        this.cdr.detectChanges();
        return of([] as Addon[]);
      })
    ).subscribe({
      next: data => {
        console.log('Home: Updating values and setting loading to false');
        this.valores = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Home: Subscription error:', err);
        this.loading = false;
        this.errorLoading = true;
        this.cdr.detectChanges();
      }
    });

    // Seguridad: Si después de 10 segundos sigue cargando, forzar fin de carga
    setTimeout(() => {
      if (this.loading) {
        console.warn('Home: Loading timeout reached, forcing loading = false');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 10000);
  }
}
