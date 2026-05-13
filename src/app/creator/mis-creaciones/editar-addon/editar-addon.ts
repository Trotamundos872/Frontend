import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Addons } from '../../../services/addons';
import { ADDON_TYPES, ADDON_TAGS } from '../../../models/addon.model';

declare var $: any;
declare var marked: any;

@Component({
  selector: 'app-editar-addon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editar-addon.html',
  styleUrl: './editar-addon.css'
})
export class EditarAddon implements OnInit, AfterViewInit {
  addonTypes = ADDON_TYPES;
  addonTags = ADDON_TAGS;
  private addonsService = inject(Addons);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  idAddon: number | null = null;
  loading = true;
  saving = false;
  deleting = false;
  errorMessage = '';
  successMessage = '';

  addonData: any = {
    nombre: '',
    urlMiniatura: '',
    tipo: '',
    tag: '',
    descripcion: '',
    textoAddon: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idAddon = +id;
      this.cargarAddon();
    } else {
      this.router.navigate(['/creator/mis-creaciones']);
    }
  }

  ngAfterViewInit() {
    // No inicializamos aquí directamente porque el loading=true oculta el textarea
  }

  private initEditorWithRetries(retryCount: number) {
    if (retryCount > 15) {
      console.error('EditarAddon: Max retries reached');
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

        //No va
        $.fn.markdownEditorBsVersion = '5';

        $('#descripcionTextarea').markdownEditor({
          preview: true,
          onPreview: function (content: any, callback: any) {
            try {
              const parsed = marked.parse(content);
              callback(parsed);
            } catch (e) {
              callback('Error al procesar markdown.');
            }
          }
        });

        // Cargar el contenido inicial en el editor
        const editor = $('#descripcionTextarea').data('markdownEditor');
        if (editor && this.addonData.textoAddon) {
          editor.setContent(this.addonData.textoAddon);
        }

      } catch (e) {
        this.initEditorWithRetries(retryCount + 1);
      }
    }, 500);
  }

  cargarAddon() {
    this.loading = true;
    this.addonsService.getAddonById(this.idAddon!.toString()).subscribe({
      next: (data) => {
        this.addonData = {
          nombre: data.nombre,
          tipo: data.tipo,
          tag: data.tag,
          urlMiniatura: data.urlMiniatura,
          descripcion: data.descripcion,
          textoAddon: data.textoAddon
        };
        this.loading = false;
        this.cdr.detectChanges();

        // Inicializamos el editor después de que el loading sea false y el DOM esté listo
        if (isPlatformBrowser(this.platformId)) {
          this.initEditorWithRetries(0);
        }
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el Addon.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        const editor = $('#descripcionTextarea').data('markdownEditor');
        if (editor) {
          this.addonData.textoAddon = editor.getContent();
        }
      } catch (e) {
        console.error('Error al obtener contenido del editor:', e);
      }
    }

    if (!this.addonData.nombre || this.addonData.nombre.trim().length < 2) {
      this.errorMessage = "El Nombre es obligatorio.";
      return;
    }

    this.saving = true;
    this.addonsService.updateAddon(this.idAddon!, this.addonData).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = '¡Addon actualizado correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/creator/mis-creaciones']);
        }, 2000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = 'Error al actualizar el Addon: ' + (err.error?.error || err.message || 'Error desconocido');
        this.cdr.detectChanges();
      }
    });
  }

  eliminar() {
    if (!confirm('¿Estás seguro de que deseas ELIMINAR este Addon? Esta acción es permanente y borrará todos los archivos asociados.')) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.deleting = true;

    this.addonsService.eliminarAddon(this.idAddon!).subscribe({
      next: () => {
        this.deleting = false;
        this.successMessage = '¡Addon eliminado correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/creator/mis-creaciones']);
        }, 2000);
      },
      error: (err) => {
        this.deleting = false;
        this.errorMessage = 'Error al eliminar el Addon: ' + (err.error?.error || err.message || 'Error desconocido');
        this.cdr.detectChanges();
      }
    });
  }
}
