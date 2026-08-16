import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SearchbarCustomEvent } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnDestroy {
  query: string = '';
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() searchCleared: EventEmitter<string> = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((query) => this.searchChange.emit(query));
  }

  onSearchChange(event: SearchbarCustomEvent) {
    const value: string = event.detail.value ?? '';
    this.query = value;
    if (value === '') {
      this.searchCleared.emit(value);
    } else {
      this.searchSubject.next(value);
    }
  }

  onSearchClear() {
    this.searchCleared.emit('');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}