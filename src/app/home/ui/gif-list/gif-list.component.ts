import { Component, input } from '@angular/core';
import { Gif } from '../../../shared/interfaces';
import { GifPlayerComponent } from '../gif-player/gif-player.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [GifPlayerComponent, CommonModule],
  template: `
    @for (gif of gifs(); track gif.permalink){

    <div>
      <app-gif-player
        [src]="gif.src"
        [thumbnail]="gif.thumbnail"
      ></app-gif-player>
    </div>

    }
  `,
})
export class GifListComponent {
  gifs = input.required<Gif[]>();
}
