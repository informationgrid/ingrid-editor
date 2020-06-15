import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SpatialBoundingBox} from '../spatial-dialog/spatial-result.model';

export interface SpatialLocation {
  title: string;
  type: 'free' | 'wkt',
  value?: SpatialBoundingBox | string
}

export interface SpatialLocationWithColor extends SpatialLocation {
  indexNumber: number;
  color: string;
}

@Component({
  selector: 'ige-spatial-list',
  templateUrl: './spatial-list.component.html',
  styleUrls: ['./spatial-list.component.scss']
})
export class SpatialListComponent implements OnInit {

  @Input() locations: SpatialLocationWithColor[];
  @Output() selectLocation = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

}
