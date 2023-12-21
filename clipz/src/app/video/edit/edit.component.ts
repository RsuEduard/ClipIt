import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(private modalService: ModalService) {}
  
  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }
  
  ngOnInit(): void {
    this.modalService.register('editClip');
  }
}
