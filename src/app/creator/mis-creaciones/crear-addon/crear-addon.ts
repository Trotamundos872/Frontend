import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Addons } from '../../../services/addons';

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
  addonData: any = {
    nombre: '',
    urlMiniatura: '',
    tipo: '',
    tag: '',
    descripcion: '',
    textoAddon: ''
  };

  errorMessage: string = '';
  successMessage: string = '';

  private platformId = inject(PLATFORM_ID);

  constructor(private addonsService: Addons, private router: Router) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('CrearAddon: ngAfterViewInit called in browser');
      setTimeout(() => {
        try {
          if (typeof $ === 'undefined') {
            console.error('CrearAddon: jQuery ($) is not defined!');
            this.errorMessage = 'Error interno: jQuery no está cargado.';
            return;
          }
          
          console.log('CrearAddon: Initializing markdown editor');
          $('#descripcionTextarea').markdownEditor({
            preview: true,
            onPreview: function (content: any, callback: any) {
              console.log('CrearAddon: onPreview called with content length:', content?.length);
              try {
                if (typeof marked === 'undefined') {
                  console.error('CrearAddon: marked is not defined globally!');
                  callback('Error: marked no está definido.');
                  return;
                }
                const parsed = marked.parse(content);
                console.log('CrearAddon: content parsed successfully');
                callback(parsed);
              } catch (e) {
                console.error('CrearAddon: Error parsing markdown in preview:', e);
                callback('Error al procesar markdown.');
              }
            }
          });
        } catch (e) {
          console.error('CrearAddon: Error initializing markdown editor:', e);
        }
      }, 100);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (isPlatformBrowser(this.platformId)) {
      // Intentar obtener el contenido del editor de markdown si existe
      try {
        const editor = $('#descripcionTextarea').data('markdownEditor');
        if (editor) {
          this.addonData.textoAddon = editor.getContent();
          console.log('CrearAddon: Content obtained from editor API:', this.addonData.textoAddon?.length);
        } else {
          this.addonData.textoAddon = $('#descripcionTextarea').val();
          console.log('CrearAddon: Content obtained from textarea val():', this.addonData.textoAddon?.length);
        }
      } catch (e) {
        console.error('CrearAddon: Error getting content from editor:', e);
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
    if (!this.addonData.descripcion || this.addonData.descripcion.trim().length < 5 || this.addonData.descripcion.length > 1000) {
      this.errorMessage = "La Descripción es obligatoria y debe tener entre 5 y 1000 caracteres.";
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
