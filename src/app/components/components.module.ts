import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MovieItemComponent } from './movie-item/movie-item.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieItemSkeletonComponent } from './movie-item/movie-item-skeleton/movie-item-skeleton.component';
import { MovieRatingsSkeletonComponent } from './movie-item/movie-ratings-skeleton/movie-ratings-skeleton.component';
import { InfoPopoverComponent } from './info-popover/info-popover.component';
import { DevMetricsComponent } from './dev-metrics/dev-metrics.component';

@NgModule({
  declarations: [
    SearchBarComponent,
    MovieItemComponent,
    MovieListComponent,
    MovieItemSkeletonComponent,
    MovieRatingsSkeletonComponent,
    InfoPopoverComponent,
    DevMetricsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    SearchBarComponent,
    MovieItemComponent,
    MovieListComponent,
    MovieItemSkeletonComponent,
    MovieRatingsSkeletonComponent,
    InfoPopoverComponent,
    DevMetricsComponent
  ]
})
export class ComponentsModule {}
