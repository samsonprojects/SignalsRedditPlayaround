import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedditService } from './shared/services/data-access/reddit.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styles: [],
})
export class AppComponent {
  redditService = inject(RedditService);
  snackBar = inject(MatSnackBar);

  constructor() {
    effect(() => {
      console.log('app error logged');
      const error = this.redditService.error();

      if (error !== null) {
        console.log('error triggered');
        this.snackBar.open(error, 'Dismiss', { duration: 2000 });
      }
    });
    // effect(() => {
    //   const error = this.redditService.error();
    //   const loadingStatus = this.redditService.loading();
    //   console.log('last known loadingstatus --', loadingStatus);
    //   console.log('effect error is :', error);
    //   if (error !== null) {
    //     console.log('snack bar should open');
    //     this.snackBar.open(error ?? 'error', 'Dismiss', { duration: 3000 });
    //   }
    // });
  }
}
