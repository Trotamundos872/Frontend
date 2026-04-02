import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Addons } from "../../services/addons";
import { Addon } from "../../models/addon.model"
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  valores: Addon[] = [];
  loading = true;
  errorLoading = false;

  constructor(private addons: Addons) { }

  ngOnInit(): void {
    this.loadAddons();
  }

  loadAddons(): void {
    this.loading = true;
    this.errorLoading = false;
    this.addons.getAll().pipe(
      retry({ count: 3, delay: 1000 }),
      catchError(err => {
        console.error('No se pudo obtener addons', err);
        this.errorLoading = true;
        this.loading = false;
        return of([] as Addon[]);
      })
    ).subscribe({
      next: data => {
        this.valores = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorLoading = true;
      }
    });
  }
}
