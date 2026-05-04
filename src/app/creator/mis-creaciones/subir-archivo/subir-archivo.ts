import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Addons } from '../../../services/addons';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-subir-archivo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './subir-archivo.html',
  styleUrl: './subir-archivo.css'
})
export class SubirArchivo implements OnInit {
  idAddon: number | null = null;
  archivoData: any = {
    nombreMostrado: '',
    url: '',
    tipo: '',
    versionJuego: '',
    versionAddon: '',
    registroCambios: '',
    addon: {
      id: null
    }
  };

  errorMessage: string = '';
  successMessage: string = '';
  isDragging: boolean = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private addonsService: Addons,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('idaddon');
    if (id) {
      this.idAddon = +id;
      this.archivoData.addon.id = this.idAddon;
    } else {
      this.router.navigate(['/mi-perfil']);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    this.selectedFileName = file.name;
    
    // Generamos un UUID simulado y el formato de URL solicitado
    const uuid = self.crypto.randomUUID();
    const extension = file.name.split('.').pop();
    const nombreSinExtension = file.name.replace(/\.[^/.]+$/, "");
    
    // Formato: uuid_nombre_archivo.extension
    this.archivoData.url = `${uuid}_${nombreSinExtension}.${extension}`;
    
    console.log('Archivo seleccionado:', file.name);
    console.log('URL Generada:', this.archivoData.url);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedFile) {
      this.errorMessage = "Debes seleccionar un archivo para subir.";
      return;
    }
    if (!this.archivoData.nombreMostrado || this.archivoData.nombreMostrado.trim().length < 2) {
      this.errorMessage = "El Nombre mostrado es obligatorio.";
      return;
    }
    if (!this.archivoData.tipo || this.archivoData.tipo.trim() === '') {
      this.errorMessage = "Debes seleccionar el Tipo de archivo.";
      return;
    }
    if (!this.archivoData.versionJuego || this.archivoData.versionJuego.trim() === '') {
      this.errorMessage = "La Versión del Juego es obligatoria.";
      return;
    }
    if (!this.archivoData.versionAddon || this.archivoData.versionAddon.trim() === '') {
      this.errorMessage = "La Versión del Addon es obligatoria.";
      return;
    }

    this.loading = true;
    console.log('Iniciando proceso de subida doble...');

    // 1. Primero subimos el archivo físico al PHP
    this.addonsService.subirArchivoReal(this.selectedFile, this.archivoData.url).pipe(
      // 2. Si la subida física tiene éxito, registramos los datos en el Backend
      switchMap((resPhp) => {
        console.log('Archivo físico subido al PHP con éxito:', resPhp);
        return this.addonsService.subirArchivo(this.archivoData);
      })
    ).subscribe({
      next: (response) => {
        console.log('Registro en base de datos completado:', response);
        this.loading = false;
        this.successMessage = '¡Archivo subido y registrado correctamente! Estará disponible tras la revisión.';
        setTimeout(() => {
          this.router.navigate(['/mi-perfil']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error en el proceso de subida:', err);
        this.errorMessage = 'Error: ' + (err.error?.error || err.message || 'Error desconocido al subir el archivo');
      }
    });
  }
}
