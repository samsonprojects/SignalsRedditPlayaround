import { computed, inject, Injectable, signal } from '@angular/core';
import { Gif, RedditPost, RedditResponse } from '../../interfaces';
import {
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { RedditMappingService } from './reddit-mapping.service';
import { FormControl } from '@angular/forms';

export interface GifState {
  gifs: Gif[];
  error: string | null;
  loading: boolean;
  lastKnownGif: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  //service has to be declared at the top other wise service is undefined
  private http = inject(HttpClient);
  subredditFormControl = new FormControl();

  //state
  private state = signal<GifState>({
    gifs: [],
    error: null,
    loading: true,
    lastKnownGif: null,
  });

  //selectors
  gifs = computed(() => this.state().gifs);
  error = computed(() => this.state().error);
  loading = computed(() => this.state().loading);
  lastKnownGif = computed(() => this.state().lastKnownGif);

  //sources
  pagination$ = new Subject<string | null>();

  private subredditChanged$ = this.subredditFormControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    startWith('gifs'),
    map((subreddit) => (subreddit.length ? subreddit : 'gifs'))
  );

  gifsLoaded$ = this.subredditChanged$.pipe(
    switchMap((subredit) =>
      this.pagination$.pipe(
        startWith(null),
        concatMap((lastKnownGif) =>
          this.fetchFromReddit(subredit, lastKnownGif, 20)
        )
      )
    )
  );

  private redditMappingService = inject(RedditMappingService);

  constructor() {
    //reducers
    this.gifsLoaded$.pipe(takeUntilDestroyed()).subscribe((response) =>
      this.state.update((state) => ({
        ...state,
        gifs: [...state.gifs, ...response.gifs],
        loading: false,
        lastKnownGif: response.lastKnownGif,
      }))
    );

    this.subredditChanged$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        loading: true,
        gifs: [],
        lastKnownGif: null,
      }))
    );
  }

  private fetchFromReddit(
    subreddit: string,
    after: string | null,
    gifsRequired: number
  ) {
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/hot/.json?limit=100` +
          (after ? `&after=${after}` : '')
      )
      .pipe(
        catchError((err) => EMPTY), // return empty so as not to break the stream
        map((response) => {
          const posts = response.data.children;
          const lastKnownGif = posts.length
            ? posts[posts.length - 1].data.name
            : null;

          return {
            gifs: this.redditMappingService.convertRedditPostsToGifs(posts),
            gifsRequired,
            lastKnownGif,
          };
        })
      );
  }
}
