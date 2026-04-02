import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Head } from './component/head/head';

//Declarar Aqui los components en uso global
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Head, NgbModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('addonsmcenter');
}
