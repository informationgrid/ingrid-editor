import { Component, OnInit } from '@angular/core';
import {GridBaseComponent} from '../grid-base/grid-base.component';

@Component({
  selector: 'ige-grid-date',
  templateUrl: './grid-date.component.html',
  styleUrls: ['./grid-date.component.scss']
})
export class GridDateComponent extends GridBaseComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
