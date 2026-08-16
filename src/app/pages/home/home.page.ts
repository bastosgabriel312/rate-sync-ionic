import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { InfoPopoverComponent } from 'src/app/components/info-popover/info-popover.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { MovieError, MovieResult } from 'src/app/core/models/movie.model';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isLoadingSearch: boolean = false;
  isLoadingMorePopulars: boolean = false;
  movieResults: MovieResult[] = [];
  moviePopularResults: MovieResult[] = [];
  searchQuery: string = '';
  popularsError: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private apiService: ApiService, private popoverController: PopoverController, private toastService: ToastService) {
    this.subscriptions.push(this.apiService.getMovieUpdates().subscribe((data) => {
      try {
        const parsedData = JSON.parse(data) as MovieResult[] | MovieError;
        if ('error' in parsedData) throw new Error(parsedData.error);
        this.movieResults = parsedData;
        this.isLoadingSearch = false;
      } catch (e) {
        this.movieResults = [];
        this.isLoadingSearch = false;
        console.error('Error:', e);
        this.toastService.showErrorToast('Não foi possível realizar a busca.');
      }
    }));
  }

  ngOnInit() {
    this.requestMorePopulars();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async onPresentPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: InfoPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.isLoadingSearch = true;
    this.apiService.searchMovies(query);
  }

  onSearchClear() {
    this.searchQuery = '';
    this.movieResults = [];
    this.isLoadingSearch = false;
  }

  requestMorePopulars() {
    this.isLoadingMorePopulars = true;
    this.popularsError = false;
    this.subscriptions.push(this.apiService.getMorePopulars().subscribe({
      next: (data) => {
        this.moviePopularResults = Array.isArray(data) ? data : [];
        this.isLoadingMorePopulars = false;
      },
      error: (error) => {
        console.error('Error fetching popular movies:', error);
        this.isLoadingMorePopulars = false;
        this.moviePopularResults = [];
        this.popularsError = true;
        this.toastService.showErrorToast('Não foi possível carregar os filmes populares.');
      }
    }));
  }
}