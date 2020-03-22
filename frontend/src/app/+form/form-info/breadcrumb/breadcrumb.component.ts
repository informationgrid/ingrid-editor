import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() path: string[];
  @Input() hideLastSeparator = true;
  @Input() showRoot = true;
  @Input() rootName = 'Daten';
  @Input() emphasize = false;

  constructor() {
  }

  ngOnInit() {
  }

}
