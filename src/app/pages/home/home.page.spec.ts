import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of, Subject } from 'rxjs';

import { HomePage } from './home.page';
import { ApiService } from 'src/app/core/services/api.service';
import { ToastService } from 'src/app/core/services/toast.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let socketSubject: Subject<string>;

  beforeEach(async () => {
    socketSubject = new Subject<string>();
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getMovieUpdates', 'getMorePopulars', 'searchMovies']);
    apiServiceSpy.getMovieUpdates.and.returnValue(socketSubject.asObservable());
    apiServiceSpy.getMorePopulars.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastService, useValue: { showErrorToast: () => Promise.resolve() } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parsing do WebSocket preenche movieResults com lista de filmes', () => {
    socketSubject.next('[{"title":"Avatar","overview":"o","poster_path":"p"}]');
    expect(component.movieResults.length).toBe(1);
    expect(component.movieResults[0].title).toBe('Avatar');
    expect(component.isLoadingSearch).toBeFalse();
  });

  it('erro vindo do WebSocket limpa movieResults', () => {
    socketSubject.next('{"error":"movie not found"}');
    expect(component.movieResults.length).toBe(0);
  });
});