import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ModalIds } from 'src/constants';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  constructor(public modal: ModalService) {}

  openModal($event: Event) {
    $event.preventDefault();

    this.modal.toggleModal(ModalIds.AuthModal);
  }
}
