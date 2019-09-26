import {Component, OnInit} from '@angular/core';
import {GridBaseComponent} from '../grid-base/grid-base.component';

@Component({
  selector: 'ige-grid-text',
  templateUrl: './grid-text.component.html',
  styleUrls: ['./grid-text.component.scss']
})
export class GridTextComponent extends GridBaseComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
