import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ModalIds } from 'src/constants';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  constructor(
    public modal: ModalService,
    public auth: AuthService,
    private afAuth: AngularFireAuth
  ) {}

  openModal($event: Event) {
    $event.preventDefault();

    this.modal.toggleModal(ModalIds.AuthModal);
  }

  async logout($event: Event) {
    $event.preventDefault();
    await this.afAuth.signOut();
  }
}
