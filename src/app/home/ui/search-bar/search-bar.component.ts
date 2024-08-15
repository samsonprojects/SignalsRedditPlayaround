import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="reddit-search-container">
      <div>
        <button (click)="selectRandomReddit.emit(true)" mat-button>
          Random Gif
        </button>
      </div>
      <div>
        <mat-toolbar>
          <mat-form-field appearance="outline">
            <input
              matInput
              placeholder="subreddit..."
              type="text"
              [formControl]="subredditFormControl()"
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </mat-toolbar>
      </div>
    </div>
  `,
  styles: `
  .reddit-search-container{
    display:flex;

  }
   mat-toolbar {
        height: 80px;
      }

      mat-form-field {
        width: 100%;
        padding-top: 20px;
      }
  `,
})
export class SearchBarComponent {
  subredditFormControl = input.required<FormControl>();
  selectRandomReddit = output<boolean>();
}
