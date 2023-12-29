import { Injectable } from '@angular/core';
import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady = false;
  private ffmpeg: FFmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();

    this.isReady = true;
  }

  async getScreenshots(file: File) {
    const data = await fetchFile(file);

    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((seconds) => {
      commands.push(
        // Input
        '-i',
        file.name,
        //Output Options
        '-ss',
        `00:00:0${seconds}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        //Output
        `output_0${seconds}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((seconds) => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${seconds}.png`
      );
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });
      const screenshotUrl = URL.createObjectURL(screenshotBlob);

      screenshots.push(screenshotUrl);
    });
    return screenshots;
  }
}
