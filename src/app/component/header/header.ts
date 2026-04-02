import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAlert, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';

import { MatIcon } from "@angular/material/icon";
import { RouterModule } from '@angular/router';

// Componente para el contenido del modal
@Component({
  selector: 'app-modal-login-content',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Acceder</h4>
      <button 
        type="button" 
        class="btn-close" 
        aria-label="Close" 
        (click)="activeModal.dismiss('Cross click')">
      </button>
    </div>
    <div class="modal-body">
      <input type="email" class="form-control" placeholder="Email" >
      <br>
      <input type="password" class="form-control" placeholder="Contraseña" >
        <br>
      <p>¿No tienes Cuenta? <a class="link">Registrarte</a></p>

    </div>
    
    <div class="modal-footer">
      <button 
        type="button" 
        class="btn btn-primary" 
        (click)="activeModal.close('Close click')">
        Entrar
      </button>
    </div>
  `,
})
export class NgbdModalContent {
  activeModal = inject(NgbActiveModal);
  @Input() name: string = 'World';
}


// Componente principal
@Component({
  selector: 'app-header',
  standalone: true,               
 imports: [RouterModule,CommonModule, NgbModule,],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],      
})
export class Header {
    private modalService = inject(NgbModal);
    closeResult: WritableSignal<string> = signal('');
    modalsNumber: WritableSignal<number> = signal(0);
  
    open() {
      const modalRef = this.modalService.open(NgbdModalContent);
      modalRef.componentInstance.name = 'Angular User';
      
      modalRef.result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed: ${reason}`);
        }
      );
    }
 
}