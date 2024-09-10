import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent {
  @Input() movies: any[] = [];
  @Input() isLoading: boolean = false;

  ngOnInit(){
    console.log("Movie> ", this.movies)
  }
}
