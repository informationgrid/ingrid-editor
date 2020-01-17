import {Component, OnInit} from '@angular/core';
import {TreeQuery} from '../../../store/tree/tree.query';

@Component({
  selector: 'ige-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  crumb = this.treeQuery.pathTitles$;

  constructor(private treeQuery: TreeQuery) {
  }

  ngOnInit() {
  }

}
