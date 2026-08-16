import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { MovieListComponent } from './movie-list.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { MovieRatings, MovieResult } from 'src/app/core/models/movie.model';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const ratings: MovieRatings = {
    cinemeta: { title: 'Avatar', rating: 7.9, year: 2009 },
    omdb: [],
    letterboxd: { title: 'Avatar', rating: 4.1, year: 2009 },
  };

  const movie: MovieResult = { title: 'Avatar', overview: '', poster_path: '' };

  beforeEach(waitForAsync(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getMovieRatings']);
    apiServiceSpy.getMovieRatings.and.returnValue(of(ratings));

    TestBed.configureTestingModule({
      declarations: [ MovieListComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastService, useValue: { showErrorToast: () => Promise.resolve() } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requestReviews busca ratings e armazena no cache por título', () => {
    component.requestReviews('Avatar');

    expect(apiServiceSpy.getMovieRatings).toHaveBeenCalledOnceWith('Avatar');
    expect(component.getReviews('Avatar')).toEqual(ratings);
  });

  it('requestReviews reusado usa o cache sem nova requisição', () => {
    component.requestReviews('Avatar');
    component.requestReviews('Avatar');

    expect(apiServiceSpy.getMovieRatings).toHaveBeenCalledTimes(1);
  });

  it('isLoadingReviews reflete o estado de carregamento do título', () => {
    expect(component.isLoadingReviews('Avatar')).toBeFalse();
    component.requestReviews('Avatar');
    expect(component.isLoadingReviews('Avatar')).toBeFalse();
  });

  it('P-04: skeletonItems é gerado com base na altura da tela (mínimo 3)', () => {
    expect(component.skeletonItems.length).toBeGreaterThanOrEqual(3);
    expect(component.skeletonItems[0]).toBe(0);
  });
});