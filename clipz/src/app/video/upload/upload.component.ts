import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { last, switchMap } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  user: firebase.User | null = null;

  isDragover: boolean = false;
  file: File | null = null;
  isFormVisible: boolean = false;
  percentage: number = 0;
  isPercentageVisible: boolean = false;
  clipFileName: string = '';

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

  private task: AngularFireUploadTask | null = null;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router
  ) {
    this.auth.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  storeFile($event: Event) {
    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.isFormVisible = true;
  }

  uploadFile() {
    this.formGroup.disable();

    this.inSubmission = true;

    this.isAlertVisible = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Uploading file...';
    this.isPercentageVisible = true;

    this.clipFileName = uuid();
    const clipPath = `clips/${this.clipFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          const clip: IClip = {
            uid: this.user?.uid!,
            displayName: this.user?.displayName!,
            title: this.title.value,
            fileName: `${this.clipFileName}.mp4`,
            url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };

          const clipDocRef = await this.clipService.createClip(clip);

          this.alertMsg = 'File uploaded successfully';
          this.alertColor = 'green';
          this.isPercentageVisible = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.formGroup.enable();
          this.alertMsg = 'File upload failed';
          this.alertColor = 'red';
          this.inSubmission = false;
          this.isPercentageVisible = false;
        },
      });
  }
}
