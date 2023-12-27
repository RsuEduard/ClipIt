import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Subscription, every, take } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit, OnDestroy {
  videoOrder: string = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;

  sort$: BehaviorSubject<string>;
  clipsSubscription$: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }
  ngOnDestroy(): void {
    this.clipsSubscription$?.unsubscribe();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
      this.sort$.next(this.videoOrder);
    });

    this.clipsSubscription$ = this.clipService
      .getUserClips(this.sort$)
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

  update($event: IClip): void {
    this.clips.forEach((element, index) => {
      if (element.docId === $event.docId) {
        this.clips[index].title = $event.title;
      }
    });
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();

    this.clipService.deleteClip(clip);

    this.clips.forEach((element, index) => {
      if (element.docId == clip.docId) {
        this.clips.splice(index, 1);
      }
    });
  }
}
