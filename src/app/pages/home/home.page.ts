import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isLoadingSearch: boolean = false;
  isLoadingMorePopulars: boolean = false;
  movieResults: any[] = [];
  moviePopularResults: any[] = [];

  constructor(private apiService: ApiService) {
    this.apiService.getMovieUpdates().subscribe((data) => {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.error) throw new Error(parsedData.error);
        this.movieResults = parsedData;
        this.isLoadingSearch = false;
      } catch (e) {
        this.movieResults = [];
        this.isLoadingSearch = false;
        console.error('Error:', e);
      }
    });
  }

  ngOnInit() {
    this.requestMorePopulars();
  }

  onSearch(query: string) {
    this.apiService.searchMovies(query);
  }
  
  onSearchClear() {
    this.movieResults = [];
    this.isLoadingSearch = false;
  }

  requestMorePopulars() {
    this.isLoadingMorePopulars = true;
    this.apiService.getMorePopulars().subscribe({
      next: (data) => {
        this.moviePopularResults = data;
        this.isLoadingMorePopulars = false;
      },
      error: (error) => {
        console.error('Error fetching popular movies:', error);
        this.isLoadingMorePopulars = false;
        this.moviePopularResults = [];
      }
    });
  }
}
