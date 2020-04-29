import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShortTreeNode} from '../../sidebars/tree/tree.component';

@Component({
  selector: 'ige-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() path: ShortTreeNode[];
  @Input() hideLastSeparator = true;
  @Input() showRoot = true;
  @Input() rootName = 'Daten';
  @Input() emphasize = false;

  @Output() select = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }

  onSelect(id: string) {
    this.select.next(id);
  }
}
