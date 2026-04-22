import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private platformId = inject(PLATFORM_ID);

  formData = {
    nombre: '',
    email: '',
    contenido: ''
  };

  errorMessage = '';

  enviarCorreo() {
    const nombre = this.formData.nombre.trim();
    const email = this.formData.email.trim();
    const contenido = this.formData.contenido.trim();

    if (!nombre) {
      this.errorMessage = 'Introduce tu alias.';
      return;
    }

    if (!email) {
      this.errorMessage = 'Introduce tu correo electrónico.';
      return;
    }

    if (!contenido) {
      this.errorMessage = 'Escribe el contenido del mensaje.';
      return;
    }

    this.errorMessage = '';

    const subject = encodeURIComponent(`Contacto desde la web - ${nombre}`);
    const body = encodeURIComponent(
      `Alias: ${nombre}\nCorreo: ${email}\n\nMensaje:\n${contenido}`
    );

    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `mailto:marcosjimgar2@gmail.com?subject=${subject}&body=${body}`;
    }
  }
}
