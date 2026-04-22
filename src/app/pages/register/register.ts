import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  nombre = '';
  email = '';
  password = '';
  esDePago = false;
  loading = false;

  registerStatus = '';
  registerStatusClass = '';
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  registerUsuario() {
    this.loading = true;
    const nombreVal = this.nombre ? this.nombre.trim() : '';
    if (!nombreVal || nombreVal.length < 2 || nombreVal.length > 60) {
      this.loading = false;
      this.registerStatus = "El nombre debe tener entre 2 y 60 caracteres.";
      this.registerStatusClass = "alert-warning";
      this.cdr.detectChanges();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailVal = this.email ? this.email.trim() : '';
    if (!emailVal || !emailRegex.test(emailVal)) {
      this.loading = false;
      this.registerStatus = "El correo electrónico no es válido.";
      this.registerStatusClass = "alert-warning";
      this.cdr.detectChanges();
      return;
    }

    if (!this.password || this.password.length < 6 || this.password.length > 100) {
      this.loading = false;
      this.registerStatus = "La contraseña debe tener entre 6 y 100 caracteres.";
      this.registerStatusClass = "alert-warning";
      this.cdr.detectChanges();
      return;
    }

    this.registerStatusClass = "alert-info";

    const baseUrl = "http://localhost:8080/api/usuario";


    const body = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      esDePago: false
    };


    this.http.post(baseUrl, body).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.registerStatus = "Exito, Bienvenido, pulse Accede";
        //Abrir Modal
        this.registerStatusClass = "alert-success";
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.loading = false;
        const errorMsg = err.error?.error || err.error?.message || "Error al conectar con el servidor";
        this.registerStatus = "Error: " + errorMsg;
        this.registerStatusClass = "alert-danger";
        this.cdr.detectChanges(); 
      }
    });
  }
}
