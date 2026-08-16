import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebsocketService } from './websocket.service';
import { MovieError, MovieRatings, MovieResult } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private socket$: Subject<string>;

  constructor(private wsService: WebsocketService, private http: HttpClient) {
    this.socket$ = this.wsService.connect(`${environment.apiDomain}/ws/find_movie/`);
  }

  getMetrics(): Observable<any> {
    return this.http.get<any>(`${environment.apiDomain}/metrics`);
  }

  searchMovies(query: string): void {
    if (query) {
      this.socket$.next(query);
    }
  }

  getMovieUpdates(): Observable<string> {
    return this.socket$;
  }

  getMorePopulars(): Observable<MovieResult[] | MovieError> {
    return this.http.get<MovieResult[] | MovieError>(`${environment.apiDomain}/more_populars`);
  }

  getMovieRatings(movieId: string): Observable<MovieRatings> {
    return this.http.get<MovieRatings>(`${environment.apiDomain}/ratings/${movieId}`);
  }
}