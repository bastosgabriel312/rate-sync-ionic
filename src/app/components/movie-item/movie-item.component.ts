import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MovieRatings, MovieResult, MovieRatingEntry } from 'src/app/core/models/movie.model';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['./movie-item.component.scss'],
})
export class MovieItemComponent {
  @Input() movie: MovieResult | undefined;
  @Input() isLoading: boolean = false;
  @Input() reviews: MovieRatings | undefined;
  @Output() requestReviews = new EventEmitter<string>();

  expanded: boolean = false;

  toggle() {
    if (!this.expanded) {
      this.expanded = true;
      this.requestReviews.emit(this.movie?.title);
    } else {
      this.expanded = false;
    }
  }

  getOmdbReviews(): MovieRatingEntry[] {
    return Array.isArray(this.reviews?.omdb) ? this.reviews!.omdb : [];
  }

  getReviewKeys(review: MovieRatingEntry): string[] {
    return Object.keys(review);
  }

  hasAnyRating(): boolean {
    return (
      this.reviews?.cinemeta?.rating != null ||
      this.getOmdbReviews().length > 0 ||
      this.reviews?.letterboxd?.rating != null
    );
  }

  isOmdbError(): boolean {
    return !!this.reviews?.omdb && !Array.isArray(this.reviews.omdb);
  }

  hasAnySourceData(): boolean {
    return (
      this.hasAnyRating() ||
      !!this.reviews?.cinemeta?.error ||
      !!this.reviews?.letterboxd?.error ||
      this.isOmdbError()
    );
  }

  getRatingIcon(rating: number | string | null | undefined, source: string): string {
    let parameters = this.getSourceRatingParameters(source)
    rating = parseFloat(String(rating ?? ''))
    if (rating >= parameters.max) {
      return 'sentiment_very_satisfied';
    } else if (rating >= parameters.mid) {
      return 'sentiment_neutral';
    } else {
      return 'sentiment_very_dissatisfied';
    }
  }

  getRatingTone(rating: number | string | null | undefined, source: string): string {
    const parameters = this.getSourceRatingParameters(source);
    const value = parseFloat(String(rating ?? ''));
    if (value >= parameters.max) {
      return 'good';
    } else if (value >= parameters.mid) {
      return 'neutral';
    } else {
      return 'bad';
    }
  }

  formatRating(rating: number | string | null | undefined, source: string): string {
    const value = Number(rating);
    if (Number.isNaN(value)) {
      return String(rating ?? '');
    }
    switch (source) {
      case 'rotten_tomatoes':
        return `${value}%`;
      case 'metacritic':
        return `${value}/100`;
      case 'Letterboxd':
        return `${value}/5`;
      case 'imdb':
      case 'Cinemeta':
      default:
        return `${value}/10`;
    }
  }

  getSourceBadgeSlug(source: string): string {
    switch (source) {
      case 'imdb':
        return 'imdb';
      case 'rotten_tomatoes':
        return 'rt';
      case 'metacritic':
        return 'metacritic';
      case 'Cinemeta':
        return 'cinemeta';
      case 'Letterboxd':
        return 'letterboxd';
      default:
        return 'default';
    }
  }

  getSourceRatingParameters(source: string) {
    let min = 0;
    let mid: number;
    let max: number;

    switch (source) {
      case 'imdb':
      case 'Cinemeta': {
        mid = 5;
        max = 7.5;
        break;
      }
      case 'rotten_tomatoes':
      case 'METACRITIC': {
        mid = 50;
        max = 75;
        break;
      }
      case 'Letterboxd': {
        mid = 2.5;
        max = 3.75;
        break;
      }
      default: {
        console.warn(`Fonte de avaliação desconhecida: ${source}`);
        mid = 5;
        max = 7.5;
        break;
      }
    }
    return { min, mid, max };
  }

}
