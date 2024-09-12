import { Component } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { InfoPopoverComponent } from 'src/app/components/info-popover/info-popover.component';
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
  isAndroid: any;

  constructor(private apiService: ApiService, private popoverController: PopoverController, private platform: Platform) {
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
    this.isAndroid = this.platform.is('android');
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
