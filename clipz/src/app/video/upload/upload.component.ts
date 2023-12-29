import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
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
  screenshots: string[] = [];
  selectedScreenshot: string = '';

  title: FormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  formGroup = new FormGroup({
    title: this.title,
  });

  private task: AngularFireUploadTask | null = null;
  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => {
      this.user = user;
    });
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.isFormVisible = true;
  }

  selectScreenshot($event: Event, screenshot: string): void {
    $event.preventDefault();
    this.selectedScreenshot = screenshot;
  }

  async uploadFile() {
    this.formGroup.disable();

    this.inSubmission = true;

    this.isAlertVisible = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Uploading file...';
    this.isPercentageVisible = true;

    this.clipFileName = uuid();
    const clipPath = `clips/${this.clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${this.clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((values) => {
      const [clipProgress, screenshotProgress] = values;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;
          const clip: IClip = {
            uid: this.user?.uid!,
            displayName: this.user?.displayName!,
            title: this.title.value,
            fileName: `${this.clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl: screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
