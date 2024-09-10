import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['./movie-item.component.scss'],
})
export class MovieItemComponent implements OnInit {
  @Input() movie: any;
  isLoading: boolean = false;
  reviews: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
  }

  requestReviews() {
    this.isLoading = true;
    this.apiService.getMovieRatings(this.movie.title).subscribe({
      next: (data) => {
        this.reviews = data;
        console.log(data)
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
    // This is called when the accordion is expanded or collapsed
    if (event.detail) {
      this.requestReviews();
    }
  }
  getReviewKeys(review: any): string[] {
    return Object.keys(review);
  }
}
