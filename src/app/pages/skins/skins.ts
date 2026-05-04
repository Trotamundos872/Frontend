import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Addons as AddonsService } from "../../services/addons";
import { Addon } from "../../models/addon.model"
import { RouterModule } from '@angular/router';
import { of, Subscription, Subject } from 'rxjs';
import { catchError, retry, timeout, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-skins',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule],
  templateUrl: './skins.html',
  styleUrls: ['./skins.css'],
})
export class Skins implements OnInit, OnDestroy {
  valores: Addon[] = [];
  loading = true;
  errorLoading = false;
  searchTerm = '';
  selectedOrder = 'normal';
  private searchSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private addonsService: AddonsService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Pre-llamada
    this.loadAddons('', 'normal');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(term: string, order?: string): void {
    this.searchTerm = term;
    if (order) {
      this.selectedOrder = order;
    }
    this.loadAddons(this.searchTerm, this.selectedOrder);
  }

  loadAddons(termino: string = '', orden: string = 'normal'): void {
    this.loading = true;
    this.errorLoading = false;

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    // Enviamos siempre la categoría 'Skin'
    this.searchSubscription = this.addonsService.getAll(termino, orden, 'Skin').pipe(
      timeout(8000),
      retry({ count: 1, delay: 1000 }),
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error fetching skins:', err);
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
