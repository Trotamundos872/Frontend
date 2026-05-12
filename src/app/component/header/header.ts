import { Component, inject, OnInit, Input, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { RouterModule, Router } from '@angular/router';
import { of, timeout, catchError } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { Inbox } from '../inbox/inbox';
import { Addons } from '../../services/addons';
import { API_URL, APP_CONFIG, AppConfig } from '../../app.constants';

//MODAL de recuperación de contraseña
@Component({
  selector: 'app-modal-recovery-content',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Recuperar Contraseña</h4>
      <button 
        type="button" 
        class="btn-close" 
        aria-label="Close" 
        (click)="activeModal.dismiss('Cancelado')">
      </button>
    </div>
    <div class="modal-body">
      <div *ngIf="step === 1">
        <p>Introduce tu correo para recibir un código de recuperación.</p>
        <input type="email" class="form-control" placeholder="Email" [(ngModel)]="email">
      </div>

      <div *ngIf="step === 2">
        <p>Introduce el código enviado y tu nueva contraseña.</p>
        <input type="text" class="form-control" placeholder="Código de 6 dígitos" [(ngModel)]="codigo">
        <br>
        <input type="password" class="form-control" placeholder="Nueva Contraseña" [(ngModel)]="nuevaPassword">
      </div>
      
      <div *ngIf="statusMessage" class="alert mt-3" [ngClass]="statusClass" role="alert">
         {{ statusMessage }}
      </div>
    </div>
    
    <div class="modal-footer">
      <button 
        *ngIf="step === 1"
        type="button" 
        class="btn btn-primary" 
        (click)="solicitarCodigo()" 
        [disabled]="loading">
        {{ loading ? 'Enviando...' : 'Enviar Código' }}
      </button>
      <button 
        *ngIf="step === 2"
        type="button" 
        class="btn btn-success" 
        (click)="resetPassword()" 
        [disabled]="loading">
        {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
      </button>
    </div>
  `,
})
export class NgbdRecoveryModalContent {
  public apiUrl = inject(API_URL);
  public appConfig = inject<AppConfig>(APP_CONFIG);
  activeModal = inject(NgbActiveModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  codigo = '';
  nuevaPassword = '';
  step = 1;
  loading = false;
  statusMessage = '';
  statusClass = '';

  solicitarCodigo() {
    if (!this.email) {
      this.statusMessage = "Introduce tu email.";
      this.statusClass = "alert-warning";
      return;
    }

    this.loading = true;
    this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, { email: this.email }).subscribe({
      next: (res: any) => {
        // Enviar el email usando el mailUrl del config (como en el registro)
        const emailBody = {
          email: this.email,
          subject: "Código de recuperación de contraseña",
          message: `Tu código de recuperación es: ${res.codigo}. Expira en 15 minutos.`
        };

        this.http.post(this.appConfig.mailUrl, emailBody).subscribe({
          next: () => {
            this.loading = false;
            this.step = 2;
            this.statusMessage = "Código enviado a tu correo.";
            this.statusClass = "alert-success";
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.statusMessage = "Código generado, pero error al enviar el email.";
            this.statusClass = "alert-danger";
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.statusMessage = err.error?.error || "Error al solicitar el código.";
        this.statusClass = "alert-danger";
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword() {
    if (!this.codigo || !this.nuevaPassword) {
      this.statusMessage = "Completa todos los campos.";
      this.statusClass = "alert-warning";
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.http.post(`${this.apiUrl}/auth/reset-password`, { 
      email: this.email, 
      codigo: this.codigo, 
      nuevaPassword: this.nuevaPassword 
    }).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = "Contraseña actualizada correctamente.";
        this.statusClass = "alert-success";
        this.cdr.detectChanges();
        setTimeout(() => this.activeModal.close('success'), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.statusMessage = err.error?.error || "Error al cambiar la contraseña.";
        this.statusClass = "alert-danger";
        this.cdr.detectChanges();
      }
    });
  }
}

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
      <p class="mt-1"><a (click)="activeModal.close('Recuperar')" class="link" style="cursor:pointer; color:blue;">¿Has olvidado tu contraseña?</a></p>
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
  public apiUrl = inject(API_URL);
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

    const baseUrl = `${this.apiUrl}/auth/login`;

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
        this.loginStatus = "Credenciales incorrectas o error en el servidor.";
        this.loginStatusClass = "alert-danger";
      }
    });
  }
}

//MODAL de usuario (Ajustes)
@Component({
  selector: 'app-modal-user-content',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Ajustes de Usuario</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="d-flex align-items-center mb-4">
        <div class="flex-shrink-0">
          <img src="user-solid-full.svg" width="60" height="60" class="rounded-circle bg-light p-2">
        </div>
        <div class="flex-grow-1 ms-3">
          <h5 class="mb-0">{{ userName }}</h5>
          <p class="text-muted mb-0">{{ email }}</p>
        </div>
      </div>

      <div class="list-group list-group-flush">
        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
          <div>
            <h6 class="mb-0">Modo Oscuro</h6>
            <small class="text-muted">Haz Click para alternar el tema</small>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="darkModeSwitch" 
                   [checked]="themeService.darkMode$ | async" (change)="toggleTheme()">
          </div>
        </div>
        
        <div *ngIf="!isCreator" class="list-group-item px-0 py-3">
          <button class="btn btn-warning w-100" (click)="becomeCreator()" [disabled]="loading">
            Convertirme en Creador
          </button>
          <div *ngIf="statusMessage" class="alert mt-2" [ngClass]="statusClass">
            {{ statusMessage }}
          </div>
        </div>

        <div class="list-group-item px-0 py-3">
          <button class="btn btn-outline-danger w-100" (click)="logout()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NgbdUserModalContent {
  public apiUrl = inject(API_URL);
  activeModal = inject(NgbActiveModal);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  public themeService = inject(ThemeService);

  @Input() userName = '';
  @Input() email = '';
  @Input() isCreator = false;

  loading = false;
  statusMessage = '';
  statusClass = '';

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

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

    this.http.post(`${this.apiUrl}/api/creador`, {}, {
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

//MODAL de Bandeja de Entrada
@Component({
  selector: 'app-modal-inbox-content',
  standalone: true,
  imports: [CommonModule, Inbox],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Bandeja de Entrada</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body p-0">
      <app-inbox [subscritos]="subscritos" [loading]="loading" (click)="activeModal.dismiss()"></app-inbox>
    </div>
  `,
})
export class NgbdInboxModalContent {
  activeModal = inject(NgbActiveModal);
  @Input() subscritos: any[] = [];
  @Input() loading = false;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgbModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  public apiUrl = inject(API_URL);
  private modalService = inject(NgbModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private addonsService = inject(Addons);
  public themeService = inject(ThemeService);
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';
  userEmail = '';
  userId: string | null = null;
  isCreator = false;
  isAdmin = false;

  // Inbox data
  subscritos: any[] = [];
  loadingInbox = true;

  ngOnInit() {
    this.checkAuth();
    this.cargarInbox();
  }

  cargarInbox() {
    this.loadingInbox = true;
    this.addonsService.getDetallesSubscritos().subscribe({
      next: (data) => {
        this.subscritos = data;
        this.loadingInbox = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingInbox = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkAuth() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        // Intentar cargar info del perfil si hay token
        this.http.get<any>(`${this.apiUrl}/api/usuario`, {
          headers: { 'Authorization': 'Bearer ' + token }
        }).subscribe({
          next: (res: any) => {
            this.isLoggedIn = true;
            this.userName = res.nombre || '';
            this.userEmail = res.email || '';
            this.userId = res.id;
            this.isCreator = res.esCreador || false;
            this.isAdmin = res.esAdmin || false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error verificando token:', err);
            this.isLoggedIn = false;
            this.isCreator = false;
            this.userName = '';
            this.userEmail = '';
            // Si el token no es válido, lo mejor es borrarlo para no liarla
            localStorage.removeItem("jwtToken");
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
    this.isAdmin = false;
  }

  openLogin() {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
        } else if (result === 'Recuperar') {
          this.openRecovery();
        }
      },
      (reason) => { }
    );
  }

  openRecovery() {
    const modalRef = this.modalService.open(NgbdRecoveryModalContent);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.openLogin(); // Volver al login tras recuperar
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

    modalRef.result.then(
      (result) => {
        if (result === 'logout') {
          this.logout();
        } else if (result === 'reload') {
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
        }
      },
      (reason) => { }
    );
  }

  openInbox() {
    const modalRef = this.modalService.open(NgbdInboxModalContent);
    modalRef.componentInstance.subscritos = this.subscritos;
    modalRef.componentInstance.loading = this.loadingInbox;
  }
}