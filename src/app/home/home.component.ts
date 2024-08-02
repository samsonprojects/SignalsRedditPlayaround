import { Component, inject } from '@angular/core';
import { GifListComponent } from './ui/gif-list/gif-list.component';
import { RedditService } from '../shared/services/data-access/reddit.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GifListComponent],
  template: `
    <app-gif-list
      [gifs]="redditService.gifs()"
      class="grid-container"
    ></app-gif-list>
  `,
  styles: ``,
  providers: [RedditService],
})
export default class HomeComponent {
  redditService = inject(RedditService);

  constructor() {}
}
