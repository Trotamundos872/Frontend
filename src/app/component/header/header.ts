import { Component, inject, OnInit, Input, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { of, timeout, catchError } from 'rxjs';

//MODAL de login
@Component({
  selector: 'app-modal-login-content',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule, RouterModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Acceder</h4>
      <button 
        type="button" 
        class="btn-close" 
        aria-label="Close" 
        (click)="activeModal.dismiss('Cancelado')">
      </button>
    </div>
    <div class="modal-body">
      <input type="email" class="form-control" placeholder="Email" [(ngModel)]="email">
      <br>
      <input type="password" class="form-control" placeholder="Contraseña" [(ngModel)]="password">
      <br>
      
      <div *ngIf="loginStatus" class="alert mt-2" [ngClass]="loginStatusClass" role="alert">
         {{ loginStatus }}
      </div>

      <p class="mt-2">¿No tienes Cuenta? <a routerLink="/register" (click)="activeModal.dismiss('Registro')" class="link" style="cursor:pointer; color:blue;">Registrarte</a></p>
    </div>
    
    <div class="modal-footer">
      <button 
        type="button" 
        class="btn btn-primary" 
        (click)="login()" 
        [disabled]="loading">
        {{ loading ? 'Enviando...' : 'Entrar' }}
      </button>
    </div>
  `,
})
export class NgbdModalContent {
  activeModal = inject(NgbActiveModal);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  email = '';
  password = '';

  loginStatus = '';
  loginStatusClass = '';
  loading = false;

  login() {
    if (!this.email || !this.password) {
      this.loginStatus = "Por favor, introduce correo y contraseña.";
      this.loginStatusClass = "alert-warning";
      return;
    }

    this.loading = true;
    this.loginStatus = "Espere Un Momento";
    this.loginStatusClass = "alert-info";

    const baseUrl = "http://localhost:8080/auth/login";

    this.http.post(baseUrl, { email: this.email, password: this.password }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Login error:', err);
        throw err;
      })
    ).subscribe({
      next: (res: any) => {
        this.loading = false;

        const currentToken = res.token;

        if (currentToken) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("jwtToken", currentToken);
          }
          this.loginStatus = "Login correcto. Token guardado.";
          this.loginStatusClass = "alert-success";

          setTimeout(() => {
            this.activeModal.close('success');
          }, 800);
        } else {
          this.loginStatus = "Respuesta incompleta: No se encontró token válido.";
          this.loginStatusClass = "alert-warning";
        }
      },
      error: (err) => {
        this.loading = false;
        let errorMessage = err.error?.message || err.statusText || "Error desconocido";
        this.loginStatus = "Error en login (Código " + err.status + "): " + errorMessage;
        this.loginStatusClass = "alert-danger";
      }
    });
  }
}

@Component({
  selector: 'app-modal-user-content',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Mi Perfil</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body text-center">
        <div class="mb-3">
            <img src="user-solid-full.svg" width="60" height="60" class="mb-2">
            <h4>{{ userName }}</h4>
            <p class="text-muted">{{ email }}</p>
        </div>

      <div *ngIf="!isCreator">
        <hr>
        <p>¿Quieres compartir tus propios Add-Ons?</p>
        <button class="btn btn-warning w-100" (click)="becomeCreator()" [disabled]="loading">
          {{ loading ? 'Procesando...' : 'Convertirme en Creador' }}
        </button>

        <div *ngIf="statusMessage" class="alert mt-3" [ngClass]="statusClass" role="alert">
          {{ statusMessage }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-danger w-100" (click)="logout()">Cerrar Sesión</button>
    </div>
  `,
})
export class NgbdUserModalContent {
  activeModal = inject(NgbActiveModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  @Input() userName = '';
  @Input() email = '';
  @Input() isCreator = false;

  loading = false;
  statusMessage = '';
  statusClass = '';

  logout() {
    this.activeModal.close('logout');
  }

  becomeCreator() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    this.loading = true;
    this.statusMessage = "Solicitando ser creador...";
    this.statusClass = "alert-info";
    this.cdr.detectChanges();

    this.http.post('http://localhost:8080/api/creador', {}, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = "¡Enhorabuena! Ya eres Creador. Recargando...";
        this.statusClass = "alert-success";
        this.cdr.detectChanges();

        setTimeout(() => {
          this.activeModal.close('reload');
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        const errorMsg = err.error?.error || err.error?.message || "Error al intentar convertirte en creador.";
        this.statusMessage = errorMsg;
        this.statusClass = "alert-danger";
        this.cdr.detectChanges();
      }
    });
  }
}


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgbModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  private modalService = inject(NgbModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  isLoggedIn = false;
  userName = '';
  userEmail = '';
  isCreator = false;

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        this.isLoggedIn = true;
        // Intentar cargar info del perfil si hay token
        this.http.get<any>('http://localhost:8080/api/creador/mi-perfil', {
          headers: { 'Authorization': 'Bearer ' + token }
        }).subscribe({
          next: (res) => {
            this.userName = res.usuario?.nombre || '';
            this.userEmail = res.usuario?.email || '';
            this.isCreator = true;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isCreator = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.isLoggedIn = false;
      }
    } else {
      this.isLoggedIn = false;
    }
    this.cdr.detectChanges();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("jwtToken");
      window.location.reload();
    }
    this.isLoggedIn = false;
    this.userName = '';
    this.userEmail = '';
    this.isCreator = false;
  }

  openLogin() {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
        }
      },
      (reason) => { }
    );
  }

  openProfile() {
    const modalRef = this.modalService.open(NgbdUserModalContent);
    modalRef.componentInstance.userName = this.userName;
    modalRef.componentInstance.email = this.userEmail;
    modalRef.componentInstance.isCreator = this.isCreator;

    modalRef.result.then((result) => {
      if (result === 'logout') {
        this.logout();
      } else if (result === 'reload') {
        if (isPlatformBrowser(this.platformId)) {
          window.location.reload();
        }
      }
    }, () => { });
  }
}