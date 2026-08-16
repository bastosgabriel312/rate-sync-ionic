import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MovieItemComponent } from './movie-item.component';
import { MovieRatings, MovieResult } from 'src/app/core/models/movie.model';

describe('MovieItemComponent', () => {
  let component: MovieItemComponent;
  let fixture: ComponentFixture<MovieItemComponent>;

  const ratings: MovieRatings = {
    cinemeta: { title: 'Avatar', rating: 7.9, year: 2009 },
    omdb: [],
    letterboxd: { title: 'Avatar', rating: 4.1, year: 2009 },
  };

  const movie: MovieResult = { title: 'Avatar', overview: '', poster_path: '' };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieItemComponent ],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggle expandido emite requestReviews com o título do filme', () => {
    spyOn(component.requestReviews, 'emit');
    component.movie = movie;
    component.toggle();
    expect(component.expanded).toBeTrue();
    expect(component.requestReviews.emit).toHaveBeenCalledOnceWith('Avatar');
  });

  it('toggle ao colapsar não reemite requestReviews', () => {
    spyOn(component.requestReviews, 'emit');
    component.movie = movie;
    component.toggle();
    component.toggle();
    expect(component.expanded).toBeFalse();
    expect(component.requestReviews.emit).toHaveBeenCalledTimes(1);
  });

  it('formatRating aplica a escala correta por fonte', () => {
    expect(component.formatRating(7.9, 'imdb')).toBe('7.9/10');
    expect(component.formatRating('81', 'rotten_tomatoes')).toBe('81%');
    expect(component.formatRating('83', 'metacritic')).toBe('83/100');
    expect(component.formatRating(4.1, 'Letterboxd')).toBe('4.1/5');
    expect(component.formatRating(7.8, 'Cinemeta')).toBe('7.8/10');
  });

  it('getOmdbReviews retorna array vazio quando omdb não é lista', () => {
    component.reviews = { ...ratings, omdb: { error: 'Movie not found' } };
    expect(component.getOmdbReviews()).toEqual([]);
  });

  it('getOmdbReviews retorna as entradas quando omdb é lista', () => {
    const entries = [{ rotten_tomatoes: { rating: 90, source_name: 'Rotten Tomatoes' } }];
    component.reviews = { ...ratings, omdb: entries };
    expect(component.getOmdbReviews()).toEqual(entries);
  });
});