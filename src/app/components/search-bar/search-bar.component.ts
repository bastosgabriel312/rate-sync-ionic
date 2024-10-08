import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  query: string = '';
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearchCleared: EventEmitter<string> = new EventEmitter<string>();

  onSearchChange(event: any) {
    if (event?.detail?.value == '') {
      this.onSearchCleared.emit(event);
    } else {
      this.searchChange.emit(this.query);
    }
  }

  onSearchClear(event: any) {
    this.onSearchCleared.emit(event);
  }
}
