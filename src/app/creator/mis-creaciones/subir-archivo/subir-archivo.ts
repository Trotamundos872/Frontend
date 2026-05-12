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
    nombreMostrado: 'test',
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
    this.archivoData.nombreMostrado = file.name;
    
    // Generamos nombre del addon
    const uuid = self.crypto.randomUUID();
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const nombreSinExtension = file.name.replace(/\.[^/.]+$/, "");
    const nombreSeguro = this.generarNombreSeguro(nombreSinExtension);

    this.archivoData.url = `${uuid}_${nombreSeguro}.${extension}`;
    

    this.archivoData.tipo = extension;
    
    console.log('Archivo seleccionado:', file.name);
    console.log('URL Generada:', this.archivoData.url);
    console.log('Tipo detectado:', this.archivoData.tipo);
  }

  private generarNombreSeguro(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedFile) {
      this.errorMessage = "Debes seleccionar un archivo para subir.";
      return;
    }

    // El tipo ahora se rellena solo al seleccionar el archivo, pero validamos que esté
    if (!this.archivoData.tipo || this.archivoData.tipo.trim() === '') {
      this.errorMessage = "No se ha detectado el tipo de archivo. Asegúrate de que el archivo tenga una extensión válida.";
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

    //SUBIR A SERVIDOR EXTERNO
    this.addonsService.subirArchivoReal(this.selectedFile, this.archivoData.url).pipe(

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
