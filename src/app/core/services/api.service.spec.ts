import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { ApiService } from './api.service';
import { WebsocketService } from './websocket.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let socketSubject: Subject<string>;

  beforeEach(() => {
    socketSubject = new Subject<string>();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: WebsocketService, useValue: {
            connect: () => socketSubject,
          } },
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('searchMovies envia a query pelo socket', () => {
    const spy = spyOn(socketSubject, 'next');
    service.searchMovies('Avatar');
    expect(spy).toHaveBeenCalledWith('Avatar');
  });

  it('searchMovies ignora query vazia', () => {
    const spy = spyOn(socketSubject, 'next');
    service.searchMovies('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('getMovieUpdates propaga mensagens recebidas do socket', (done) => {
    service.getMovieUpdates().subscribe((data) => {
      expect(data).toBe('[{ "title": "Avatar" }]');
      done();
    });
    socketSubject.next('[{ "title": "Avatar" }]');
  });

  it('getMorePopulars chama GET /more_populars', () => {
    service.getMorePopulars().subscribe();
    const req = httpMock.expectOne(`${environment.apiDomain}/more_populars`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getMovieRatings chama GET /ratings/{movieId}', () => {
    service.getMovieRatings('Avatar').subscribe();
    const req = httpMock.expectOne(`${environment.apiDomain}/ratings/Avatar`);
    expect(req.request.method).toBe('GET');
    req.flush({ cinemeta: {}, omdb: [], letterboxd: {} });
  });
});