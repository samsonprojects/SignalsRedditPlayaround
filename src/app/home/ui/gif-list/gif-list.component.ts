import { Component, inject, input } from '@angular/core';
import { Gif } from '../../../shared/interfaces';
import { GifPlayerComponent } from '../gif-player/gif-player.component';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MatToolbar } from '@angular/material/toolbar';
import { WINDOW } from '../../../shared/utils/injection-token';

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [GifPlayerComponent, CommonModule, SearchBarComponent, MatToolbar],
  template: `
    @for (gif of gifs(); track gif.permalink){
    <div>
      <app-gif-player
        [src]="gif.src"
        [thumbnail]="gif.thumbnail"
      ></app-gif-player>
      <div>
        <mat-toolbar>
          <span>{{ gif.title }}</span>
          <span class="toolbar-spacer"></span>
          <button
            mat-icon-button
            (click)="window.open('https://reddit.com/' + gif.permalink)"
          ></button>
        </mat-toolbar>
      </div>
    </div>

    }@empty {
    <p>Can't find any gifs 🤷</p>
    }
  `,
  styles: `div {
  margin: 1rem;
  filter: drop-shadow(0px 0px 6px #0e0c1ba8);
}

mat-toolbar {
  white-space: break-spaces;
}

p {
  font-size: 2em;
  width: 100%;
  text-align: center;
  margin-top: 4rem;
}`,
})
export class GifListComponent {
  gifs = input.required<Gif[]>();
  window = inject(WINDOW);
}
