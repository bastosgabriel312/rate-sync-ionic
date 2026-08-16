import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AccordionGroupCustomEvent, IonicModule } from '@ionic/angular';

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

  it('emite requestReviews com o título do filme ao expandir o accordion', () => {
    spyOn(component.requestReviews, 'emit');
    component.movie = movie;
    component.accordionGroupChange({ detail: {} } as AccordionGroupCustomEvent);
    expect(component.requestReviews.emit).toHaveBeenCalledOnceWith('Avatar');
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