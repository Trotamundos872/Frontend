import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL, APP_CONFIG, AppConfig } from '../../app.constants';

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
  
  //Inicio en formulario base
  // Si TODO BIEN -> step = 2;
  step = 1; 
  verificationCode = '';
  userCode = '';
  
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = inject(API_URL);
  private appConfig = inject<AppConfig>(APP_CONFIG);

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
    // Generar código de 6 dígitos
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const emailBody = {
      email: this.email,
      subject: "Código de Verificación - Add-Ons MCender",
      message: `Hola ${this.nombre},\n\nTu código de verificación es: ${this.verificationCode}\n\nIntroduce este código en la web para completar tu registro.`
    };


    //Uso endpoint privado de mi web en produccion
    this.http.post(this.appConfig.mailUrl, emailBody).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.step = 2;
        this.registerStatus = "";
        this.registerStatusClass = "";
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error enviando correo:', err);
        this.registerStatus = "Error al enviar el correo de verificación. Inténtalo de nuevo.";
        this.registerStatusClass = "alert-danger";
        this.cdr.detectChanges();
      }
    });
  }

  confirmarCodigo() {
    if (this.userCode !== this.verificationCode) {
      this.registerStatus = "El código introducido es incorrecto.";
      this.registerStatusClass = "alert-danger";
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.registerStatus = "Código correcto, finalizando registro...";
    this.registerStatusClass = "alert-info";
    this.cdr.detectChanges();

    const baseUrl = `${this.apiUrl}/api/usuario`;
    const body = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      esDePago: false
    };

    this.http.post(baseUrl, body).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.registerStatus = "Éxito, Bienvenido, pulse Accede";
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
