import {
  OnChanges,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;

  title: FormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  clipId = new FormControl('', {
    nonNullable: true,
  });

  editForm: FormGroup = new FormGroup({
    title: this.title,
    id: this.clipId,
  });

  constructor(private modalService: ModalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }

    this.clipId.setValue(this.activeClip.docId!);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }

  ngOnInit(): void {
    this.modalService.register('editClip');
  }

  submit(): void {}
}
