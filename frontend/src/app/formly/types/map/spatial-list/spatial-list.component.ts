import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface SpatialLocation {
  title: string;
  type: 'bbox',
  box?: {
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  }
}

export interface SpatialLocationWithColor extends SpatialLocation {
  color: string;
}

@Component({
  selector: 'ige-spatial-list',
  templateUrl: './spatial-list.component.html',
  styleUrls: ['./spatial-list.component.scss']
})
export class SpatialListComponent implements OnInit {

  @Input() locations: SpatialLocationWithColor[];
  @Output() remove = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

}
