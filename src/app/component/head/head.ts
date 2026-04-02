import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-head',
  template: '',
  styleUrl: './head.css',
})
export class Head {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.titleService.setTitle('Addons Center');
    this.metaService.addTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });

    // Solo manipular el DOM en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
      document.head.appendChild(link);
    }
  }
}
