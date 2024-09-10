import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MovieRatingsSkeletonComponent } from './movie-ratings-skeleton.component';

describe('MovieRatingsSkeletonComponent', () => {
  let component: MovieRatingsSkeletonComponent;
  let fixture: ComponentFixture<MovieRatingsSkeletonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieRatingsSkeletonComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRatingsSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
