import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  constructor(private storage: AngularFireStorage) {}

  isDragover: boolean = false;
  file: File | null = null;
  isFormVisible: boolean = false;

  isAlertVisible: boolean = false;
  alertColor: string = 'blue';
  alertMsg: string = '';
  inSubmission: boolean = false;

  title: FormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  formGroup = new FormGroup({
    title: this.title,
  });

  storeFile($event: DragEvent) {
    this.isDragover = false;
    this.file = $event.dataTransfer?.files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.isFormVisible = true;
  }

  uploadFile() {
    this.inSubmission = true;

    this.isAlertVisible = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Uploading file...';
    
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const task = this.storage.upload(clipPath, this.file);
    task.then((_) => {
      this.isAlertVisible = true;
      this.alertMsg = 'File uploaded successfully';
      this.alertColor = 'green';
    });
  }
}
