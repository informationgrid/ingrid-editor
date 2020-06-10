import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface SpatialLocation {
  title: string;
  type: 'bbox' | 'text',
  value?: {
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  } | string
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
  @Output() hoverLocation = new EventEmitter<SpatialLocationWithColor>();
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

}
