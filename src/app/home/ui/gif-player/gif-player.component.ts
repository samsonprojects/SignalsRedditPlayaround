import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { fromEvent, Subject, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface GifPlayerState {
  playing: boolean;
  status: 'initial' | 'loading' | 'loaded';
}

@Component({
  selector: 'app-gif-player',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if(status() === 'loading'){
    <mat-progress-spinner mode="indeterminate" diameter="50" />
    }
    <div
      class="preload-background"
      [style]="getStyle()"
      [class.blur]="
        status() != 'loaded' &&
        !['/assets/nsfw.png', '/assets/default.png'].includes(thumbnail())
      "
    >
      <video
        (click)="togglePlay$.next()"
        #gifPlayer
        playsinline
        preload="none"
        [loop]="true"
        [muted]="true"
        [src]="src()"
      ></video>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        max-height: 80vh;
      }

      .preload-background {
        width: 100%;
        height: auto;
      }

      .blur {
        filter: blur(10px) brightness(0.6);
        transform: scale(1.1);
      }

      video {
        width: 100%;
        max-height: 80vh;
        height: auto;
        margin: auto;
        background: transparent;
      }

      mat-progress-spinner {
        position: absolute;
        top: 2em;
        right: 2em;
        z-index: 1;
      }
    `,
  ],
})
export class GifPlayerComponent {
  src = input.required<string>();
  thumbnail = input.required<string>();

  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('gifPlayer');
  videoElement$ = toObservable(this.videoElement);

  state = signal<GifPlayerState>({
    playing: false,
    status: 'initial',
  });

  //selectors
  playing = computed(() => this.state().playing);
  status = computed(() => this.state().status);

  //sources
  //are things we want to react to in order to trigger state updates
  togglePlay$ = new Subject<void>();

  videoLoadStart$ = this.togglePlay$.pipe(
    switchMap(() => this.videoElement$),
    switchMap(({ nativeElement }) => fromEvent(nativeElement, 'loadstart'))
  );

  videoLoadComplete$ = this.videoElement$.pipe(
    switchMap(({ nativeElement }) => fromEvent(nativeElement, 'loadeddata'))
  );

  constructor() {
    //reducers
    this.videoLoadStart$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        status: 'loading',
      }))
    );

    this.videoLoadComplete$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        status: 'loaded',
      }))
    );

    this.togglePlay$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        playing: !state.playing,
      }))
    );

    //effects are triggered when any signals values change
    effect(() => {
      const { nativeElement: video } = this.videoElement();
      const playing = this.playing();
      const status = this.status();

      if (!video) return;
      if (playing && status === 'initial') {
        video.load();
      }

      if (status === 'loaded') {
        playing ? video.play() : video.pause();
      }
    });
  }

  getStyle() {
    const style =
      'background-image :url(' +
      "'" +
      this.thumbnail() +
      "'" +
      ') 50% 50% / cover no-repeat';
    return style;
  }
}
