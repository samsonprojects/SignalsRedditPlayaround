import { computed, inject, Injectable, signal } from '@angular/core';
import { Gif, RedditResponse } from '../../interfaces';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  expand,
  map,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  private error$ = new Subject<string | null>();

  //selectors
  gifs = computed(() => this.state().gifs);
  error = computed(() => {
    return this.state().error;
  });

  loading = computed(() => {
    console.log(' loading-- triggered');
    return this.state().loading;
  });
  lastKnownGif = computed(() => {
    console.log('lastKnownGif-- triggered');
    return this.state().lastKnownGif;
  });

  //sources
  pagination$ = new Subject<string | null>();

  private subredditChanged$ = this.subredditFormControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    startWith('gifs'),
    map((subreddit) => (subreddit.length ? subreddit : 'gifs'))
  );

  gifsLoaded$ = this.subredditChanged$.pipe(
    switchMap((subreddit) =>
      this.pagination$.pipe(
        startWith(null),
        concatMap((lastKnownGif) =>
          this.fetchFromReddit(subreddit, lastKnownGif, 20).pipe(
            expand((response, index) => {
              const { gifs, gifsRequired, lastKnownGif } = response;
              const remainingGifsToFetch = gifsRequired - gifs.length;
              const maxAttempts = 15;

              const shouldKeepTrying =
                remainingGifsToFetch > 0 &&
                index < maxAttempts &&
                lastKnownGif !== null;

              return shouldKeepTrying
                ? this.fetchFromReddit(
                    subreddit,
                    lastKnownGif,
                    remainingGifsToFetch
                  )
                : EMPTY;
            })
          )
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

    this.error$.pipe(takeUntilDestroyed()).subscribe((error) =>
      this.state.update((state) => ({
        ...state,
        error,
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
        catchError((err) => {
          this.handleError(err);
          return EMPTY;
        }), // return empty so as not to break the stream
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

  private handleError(err: HttpErrorResponse) {
    console.log('error handler', err);
    if (err.status === 404 && err.url) {
      console.log('nexted error');
      this.error$.next(`Failed to load gifs for /r/${err.url.split('/')[4]}`);
      return;
    }

    console.log('trigger generic error');
    //generic error
    this.error$.next(err.statusText);
  }
}
