import { Component, AfterViewInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Addons } from '../../../services/addons';
import { ADDON_TYPES, ADDON_TAGS } from '../../../models/addon.model';

declare var $: any;
declare var marked: any;

@Component({
  selector: 'app-crear-addon',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './crear-addon.html',
  styleUrl: './crear-addon.css'
})
export class CrearAddon implements AfterViewInit {
  addonTypes = ADDON_TYPES;
  addonTags = ADDON_TAGS;
  addonData: any = {
    nombre: '',
    urlMiniatura: '',
    tipo: '',
    tag: '',
    descripcion: '',
    textoAddon: ''
  };

  loading = false;
  errorMessage: string = '';
  successMessage: string = '';

  private platformId = inject(PLATFORM_ID);
  private addonsService = inject(Addons);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initEditorWithRetries(0);
    }
  }

  private initEditorWithRetries(retryCount: number) {
    if (retryCount > 20) {
      console.error('CrearAddon: No se pudo inicializar el editor Markdown tras varios intentos.');
      return;
    }

    setTimeout(() => {
      try {
        const isJQueryOk = typeof $ !== 'undefined';
        const isPluginOk = isJQueryOk && typeof $.fn.markdownEditor !== 'undefined';

        if (!isPluginOk) {
          this.initEditorWithRetries(retryCount + 1);
          return;
        }

        // Establecer la versión de Bootstrap para el plugin
        $.fn.markdownEditorBsVersion = '5';

        const $textarea = $('#descripcionTextarea');
        if ($textarea.length === 0) {
          this.initEditorWithRetries(retryCount + 1);
          return;
        }

        $textarea.markdownEditor({
          preview: true,
          onPreview: function (content: any, callback: any) {
            try {
              if (typeof marked !== 'undefined') {
                const parsed = marked.parse ? marked.parse(content) : marked(content);
                callback(parsed);
              } else {
                callback('Error: marked no cargado.');
              }
            } catch (e) {
              callback('Error al procesar markdown.');
            }
          }
        });

        this.cdr.detectChanges();
      } catch (e) {
        this.initEditorWithRetries(retryCount + 1);
      }
    }, 300);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (isPlatformBrowser(this.platformId)) {
      try {
        const editor = $('#descripcionTextarea').data('markdownEditor');
        if (editor) {
          this.addonData.textoAddon = editor.getContent();
        } else {
          this.addonData.textoAddon = $('#descripcionTextarea').val();
        }
      } catch (e) {
        this.addonData.textoAddon = $('#descripcionTextarea').val();
      }
    }

    if (!this.addonData.nombre || this.addonData.nombre.trim().length < 2 || this.addonData.nombre.length > 60) {
      this.errorMessage = "El Nombre del Proyecto es obligatorio y debe tener entre 2 y 60 caracteres.";
      return;
    }
    if (!this.addonData.urlMiniatura || this.addonData.urlMiniatura.trim() === '') {
      this.errorMessage = "La URL de Miniatura es obligatoria.";
      return;
    }
    if (!this.addonData.tipo || this.addonData.tipo.trim() === '') {
      this.errorMessage = "Debes seleccionar el Tipo de proyecto.";
      return;
    }
    if (!this.addonData.tag || this.addonData.tag.trim() === '') {
      this.errorMessage = "Debes seleccionar un Tag / Categoría.";
      return;
    }
    if (!this.addonData.descripcion || this.addonData.descripcion.trim().length < 5 || this.addonData.descripcion.length > 2000) {
      this.errorMessage = "La Descripción es obligatoria y debe tener entre 5 y 2000 caracteres.";
      return;
    }
    if (!this.addonData.textoAddon || this.addonData.textoAddon.trim().length < 5) {
      this.errorMessage = "La Descripción Detallada (Markdown) es obligatoria y debe tener al menos 5 caracteres.";
      return;
    }

    this.addonsService.createAddon(this.addonData).subscribe({
      next: (response) => {
        this.successMessage = '¡Proyecto creado con éxito!';

        setTimeout(() => {
          this.router.navigate(['/mi-perfil']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error al crear addon:', err);
        let errorMsg = 'Hubo un error al crear el proyecto.';
        if (err.error) {
          errorMsg += ' Detalles: ' + JSON.stringify(err.error);
        }
        this.errorMessage = errorMsg;
      }
    });
  }
}
