import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { take } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
    });

    this.clipService
      .getUserClips()
      .pipe(take(1))
      .subscribe((docs) => {
        this.clips = [];

        docs.forEach((doc) => {
          this.clips.push({
            docId: doc.id,
            ...doc.data(),
          });
        });
      });
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    this.router.navigate([], {
      queryParams: {
        sort: value,
      },
      relativeTo: this.route,
    });
  }

  openModal(clip: IClip) {
    this.modalService.toggleModal('editClip');
    this.activeClip = clip;
    return false;
  }
}
