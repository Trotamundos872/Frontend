import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
//Libreria markdown para convertir texto a html (Sin permitir leer el HTML como tal)
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeHtml {
    console.log('MarkdownPipe: transform called with value:', value);
    if (!value) {
      console.log('MarkdownPipe: value is empty, returning empty string');
      return '';
    }

    const processedValue = value.replace(/^(#+)([^#\s])/gm, '$1 $2');
    console.log('MarkdownPipe: processedValue:', processedValue);

    try {
      const html = marked.parse(processedValue, { breaks: true }) as string;
      console.log('MarkdownPipe: generated html:', html);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('MarkdownPipe: Error parsing markdown:', error);
      return value;
    }
  }
}
