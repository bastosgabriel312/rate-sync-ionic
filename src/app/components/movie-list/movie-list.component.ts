import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { ApiService } from 'src/app/core/services/api.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { MovieRatings, MovieResult } from 'src/app/core/models/movie.model';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnDestroy {
  @Input() movies: MovieResult[] = [];
  @Input() isLoading: boolean = false;

  skeletonItems: number[] = [];

  private reviewsCache = new Map<string, MovieRatings>();
  private loadingTitles = new Set<string>();
  private subscriptions: Subscription[] = [];

  constructor(private apiService: ApiService, private toastService: ToastService, private platform: Platform) {
const itemHeight = 320;
const count = Math.max(2, Math.round(this.platform.height() / itemHeight));
    this.skeletonItems = Array.from({ length: count }, (_, i) => i);
  }

  getReviews(title: string): MovieRatings | undefined {
    return this.reviewsCache.get(title);
  }

  isLoadingReviews(title: string): boolean {
    return this.loadingTitles.has(title);
  }

  requestReviews(title: string) {
    if (this.reviewsCache.has(title) || this.loadingTitles.has(title)) {
      return;
    }
    this.loadingTitles.add(title);
    this.subscriptions.push(this.apiService.getMovieRatings(title).subscribe({
      next: (data) => {
        this.reviewsCache.set(title, data);
        this.loadingTitles.delete(title);
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.loadingTitles.delete(title);
        this.toastService.showErrorToast('Não foi possível carregar as avaliações.');
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}