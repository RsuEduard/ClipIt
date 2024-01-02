import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  register(id: string): void {
    this.modals.push({
      id,
      visible: false,
    });
  }

  unregister(id: string): void {
    this.modals = this.modals.filter((m) => m.id !== id);
  }

  isModalVisible(id: string): boolean {
    return !!this.modals.find((m) => m.id === id)?.visible;
  }

  toggleModal(id: string): void {
    const modal = this.modals.find((m) => m.id === id);

    if (!!modal) {
      modal.visible = !modal.visible;
    }
  }
}
