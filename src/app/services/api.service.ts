import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private socket$: Subject<any>;

  constructor(private wsService: WebsocketService, private http:HttpClient) {
    this.socket$ = this.wsService.connect(`${environment.apiDomain}/ws/find_movie/`);
  }

  searchMovies(query: string): void {
    if (query) {
      this.socket$.next(query);
    }
  }

  getMovieUpdates(){
    return this.socket$;
  }

  getMorePopulars(): Observable<any> {
    return this.http.get<any>(`${environment.apiDomain}/more_populars`);
  }

  getMovieRatings(movie_id:string): Observable<any> {
    return this.http.get<any>(`${environment.apiDomain}/ratings/${movie_id}`);
  }
  
}
