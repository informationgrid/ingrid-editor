import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SpatialBoundingBox} from '../spatial-dialog/spatial-result.model';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Observable} from 'rxjs';

export type SpatialLocationType = 'free' | 'wkt' | 'geo-name';

export interface SpatialLocation {
  title: string;
  type: SpatialLocationType,
  value?: SpatialBoundingBox | string
}

export interface SpatialLocationWithColor extends SpatialLocation {
  indexNumber: number;
  color: string;
}

@UntilDestroy()
@Component({
  selector: 'ige-spatial-list',
  templateUrl: './spatial-list.component.html',
  styleUrls: ['./spatial-list.component.scss']
})
export class SpatialListComponent implements OnInit {

  @Input() locations: Observable<SpatialLocationWithColor[]>;
  @Output() selectLocation = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  typedLocations: { [x: string]: SpatialLocationWithColor[] };
  types: string[];

  constructor() {
  }

  ngOnInit(): void {

    this.locations
      .pipe(untilDestroyed(this))
      .subscribe(locations => this.updateLocations(locations));

  }

  private updateLocations(locations: SpatialLocationWithColor[]) {

    this.typedLocations = locations
      .reduce((prev, curr) => {
        prev[curr.type].push(curr);
        return prev;
      }, {wkt: [], free: [], 'geo-name': []});

    this.types = Object.keys(this.typedLocations)
      .filter(type => this.typedLocations[type].length > 0);

  }

  getTypeName(type: SpatialLocationType) {
    switch (type) {
      case 'free':
        return 'Freier Raumbezug';
      case 'wkt':
        return 'WKT';
      case 'geo-name':
        return 'Geographischer Name';
    }
  }
}
