import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccordionGroupCustomEvent } from '@ionic/angular';
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

  accordionGroupChange(event: AccordionGroupCustomEvent) {
    if (event.detail) {
      this.requestReviews.emit(this.movie?.title);
    }
  }
  getOmdbReviews(): MovieRatingEntry[] {
    return Array.isArray(this.reviews?.omdb) ? this.reviews!.omdb : [];
  }
  getReviewKeys(review: MovieRatingEntry): string[] {
    return Object.keys(review);
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