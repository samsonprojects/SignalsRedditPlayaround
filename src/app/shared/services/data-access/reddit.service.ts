import { computed, inject, Injectable, signal } from '@angular/core';
import { Gif, RedditPost, RedditResponse } from '../../interfaces';
import { catchError, EMPTY, map, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { RedditMappingService } from './reddit-mapping.service';

export interface GifState {
  gifs: Gif[];
}

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  //service has to be declared at the top other wise service is undefined
  private http = inject(HttpClient);

  //state
  private state = signal<GifState>({
    gifs: [],
  });

  //selectors
  gifs = computed(() => this.state().gifs);

  //sources
  gifsLoaded$ = this.fetchFromReddit('gifs');

  private reddingMappingService = inject(RedditMappingService);

  constructor() {
    //reducers
    this.gifsLoaded$.pipe(takeUntilDestroyed()).subscribe((gifs) =>
      this.state.update((state) => ({
        ...state,
        gifs: [...state.gifs, ...gifs],
      }))
    );
  }

  private fetchFromReddit(subreddit: string) {
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/hot/.json?limit=100`
      )
      .pipe(
        catchError((err) => EMPTY), // return empty so as not to break the stream
        map((response) =>
          this.reddingMappingService.convertRedditPostsToGifs(
            response.data.children
          )
        )
      );
  }
}
