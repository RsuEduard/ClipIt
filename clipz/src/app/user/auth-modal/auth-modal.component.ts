import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { ModalIds } from 'src/constants';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent implements OnInit, OnDestroy {
  public authModalId: string = ModalIds.AuthModal;

  constructor(public modal: ModalService) {}

  ngOnInit(): void {
    this.modal.register(this.authModalId);
  }

  ngOnDestroy(): void {
    this.modal.unregister(this.authModalId);
  }
}
