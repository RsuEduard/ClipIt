import { Component } from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  isDragover: boolean = false;
  file: File | null = null;
  isFormVisible: boolean = false;

  storeFile($event: DragEvent) {
    this.isDragover = false;
    this.file = $event.dataTransfer?.files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.isFormVisible = true;
  }
}
