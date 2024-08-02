import { Injectable } from '@angular/core';
import { Gif, RedditPost } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class RedditMappingService {
  constructor() {}

  public convertRedditPostsToGifs(posts: RedditPost[]) {
    //todo implement
    const defaultThumbnails = ['default', 'none', 'nsfw'];

    return posts
      .map((post) => {
        const thumbnail = post.data.thumbnail;
        const modifiedThumbnail = defaultThumbnails.includes(thumbnail)
          ? `/assets/${thumbnail}.png`
          : thumbnail;

        const validThumbnail =
          modifiedThumbnail.endsWith('.jpg') ||
          modifiedThumbnail.endsWith('.png');

        return {
          src: this.getBestSrcForGif(post),
          author: post.data.author,
          name: post.data.name,
          permalink: post.data.permalink,
          title: post.data.title,
          thumbnail: validThumbnail ? modifiedThumbnail : `/assets/default.png`,
          comments: post.data.num_comments,
        };
      })
      .filter((post): post is Gif => post.src !== null);
  }

  public getBestSrcForGif(post: RedditPost) {
    //If the source is mp4 leave as is
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }
    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    return null;
  }
}
