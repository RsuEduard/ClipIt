import { Injectable, inject } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
  firstValueFrom,
  Observable,
} from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  ActivatedRouteSnapshot,
  Resolve,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService{
  public clipsCollection: AngularFirestoreCollection<IClip>;
  public pageClips: IClip[] = [];
  public pendingReq: boolean = false;

  constructor(
    db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');
        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenthotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    forkJoin([clipRef.delete(), screenthotRef.delete()]).subscribe(async () => {
      await this.clipsCollection.doc(clip.docId).delete();
    });
  }

  async getClips() {
    if (this.pendingReq) {
      return;
    }
    this.pendingReq = true;

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    const { length } = this.pageClips;

    if (length) {
      const lastDocId = this.pageClips[length - 1].docId;
      const lastDoc = await firstValueFrom(
        this.clipsCollection.doc(lastDocId).get()
      );
      query = query.startAfter(lastDoc);
    }
    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({ docId: doc.id, ...doc.data() });
    });

    this.pendingReq = false;
  }

  navigateHome() {
    this.router.navigate(['/']);
  }
}

export const clipResolver: ResolveFn<IClip | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(ClipService)
    .clipsCollection.doc(route.params.id)
    .get()
    .pipe(
      map((snapshot) => {
        const data = snapshot.data();
        if (!data) {
          inject(ClipService).navigateHome();
          return null;
        }
        return data;
      })
    );
};
