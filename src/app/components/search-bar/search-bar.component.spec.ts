import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, SearchbarCustomEvent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBarComponent ],
      imports: [IonicModule.forRoot(), FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debounce 300ms: emite searchChange apenas após a pausa', fakeAsync(() => {
    const spy = jasmine.createSpy('searchChange');
    component.searchChange.subscribe(spy);

    component.onSearchChange({ detail: { value: 'a' } } as SearchbarCustomEvent);
    tick(150);
    component.onSearchChange({ detail: { value: 'av' } } as SearchbarCustomEvent);
    tick(150);
    expect(spy).not.toHaveBeenCalled();

    tick(160);
    expect(spy).toHaveBeenCalledOnceWith('av');
  }));

  it('emite searchCleared imediatamente quando o campo é limpo', () => {
    const spy = jasmine.createSpy('searchCleared');
    component.searchCleared.subscribe(spy);

    component.onSearchChange({ detail: { value: '' } } as SearchbarCustomEvent);

    expect(spy).toHaveBeenCalled();
  });
});