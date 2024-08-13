import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedditService } from './shared/services/data-access/reddit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent {
  redditService = inject(RedditService);
  snackBar = inject(MatSnackBar);

  constructor() {
    effect(() => {
      const test = this.redditService.error();
      console.log('test', test);
      //todo fix issu where the effect is not triggering for error
      // this.redditService.error();
      // const error = this.redditService.error();
      // const loading = this.redditService.loading();
      console.log('app effect triggered');
      // if (error !== null) {
      //   this.snackBar.open(error, 'Dismiss', { duration: 2000 });
      // }
    });
  }
}
