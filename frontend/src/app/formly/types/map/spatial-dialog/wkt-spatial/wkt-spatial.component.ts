import {Component, Input, OnInit} from '@angular/core';
import {Map} from 'leaflet';
import {LeafletService} from '../../leaflet.service';

@Component({
  selector: 'ige-wkt-spatial',
  templateUrl: './wkt-spatial.component.html',
  styleUrls: ['./wkt-spatial.component.scss']
})
export class WktSpatialComponent implements OnInit {

  @Input() map: Map;

  constructor(private leafletService: LeafletService) {
  }

  ngOnInit(): void {
  }

  validateWKT(value: string) {
    this.leafletService.convertWKT(this.map, value);
  }
}
