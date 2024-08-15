import { Component, inject } from '@angular/core';
import { GifListComponent } from './ui/gif-list/gif-list.component';
import { RedditService } from '../shared/services/data-access/reddit.service';
import {
  InfiniteScrollDirective,
  InfiniteScrollModule,
} from 'ngx-infinite-scroll';
import { SearchBarComponent } from './ui/search-bar/search-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    GifListComponent,
    SearchBarComponent,
    MatProgressSpinnerModule,
    InfiniteScrollDirective,
  ],
  template: `
    <app-search-bar
      [subredditFormControl]="redditService.subredditFormControl"
      (selectRandomReddit)="redditService.selectRandomSubreddit$.next(true)"
    >
    </app-search-bar>

    @if(redditService.loading()){
    <mat-progress-spinner
      mode="indeterminate"
      diameter="50"
    ></mat-progress-spinner>
    }@else {
    <app-gif-list
      [gifs]="redditService.gifs()"
      infinite-scroll
      (scrolled)="redditService.pagination$.next(redditService.lastKnownGif())"
      class="grid-container"
    ></app-gif-list>
    }
  `,
  styles: ``,
  providers: [RedditService, InfiniteScrollModule],
})
export default class HomeComponent {
  redditService = inject(RedditService);

  constructor() {}
}
