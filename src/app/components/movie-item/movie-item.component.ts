import { Component, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['./movie-item.component.scss'],
})
export class MovieItemComponent {
  @Input() movie: any;
  isLoading: boolean = false;
  reviews: any = {};

  constructor(private apiService: ApiService) { }

  requestReviews() {
    this.isLoading = true;
    this.apiService.getMovieRatings(this.movie.title).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.isLoading = false;
        this.reviews = {};
      }
    });
  }

  accordionGroupChange(event: any) {
    if (event.detail) {
      this.requestReviews();
    }
  }
  getReviewKeys(review: any): string[] {
    return Object.keys(review);
  }

  convertToNumber(americanNumber: any): number {
    const numberAsString = String(americanNumber);


    const numberWithoutCommas = numberAsString.replace(/,/g, '');
    return parseFloat(numberWithoutCommas);
  }

  getRatingIcon(rating: any, source: string): string {
    let parameters = this.getSourceRatingParameters(source)
    rating = parseFloat(rating)
    console.log(rating >= parameters.max,rating,source)
    if (rating >= parameters.max) {
      return 'sentiment_very_satisfied';  // Ícone de feliz
    } else if (rating >= parameters.mid) {
      return 'sentiment_neutral';  // Ícone de neutro
    } else {
      return 'sentiment_very_dissatisfied';  // Ícone de triste
    }
  }

  getSourceRatingParameters(source: string) {
    let min = 0;
    let mid: number;
    let max: number;

    switch (source) {
      case 'imdb': 
      case 'TMDB':{
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
