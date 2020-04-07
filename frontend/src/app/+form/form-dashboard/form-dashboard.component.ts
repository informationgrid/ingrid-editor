import { Component, OnInit } from '@angular/core';
import {TreeQuery} from "../../store/tree/tree.query";
import {Observable} from "rxjs";

@Component({
  selector: 'ige-form-dashboard',
  templateUrl: './form-dashboard.component.html',
  styleUrls: ['./form-dashboard.component.scss']
})
export class FormDashboardComponent implements OnInit {

  treeDocs: Observable<number> = this.treeQuery.selectCount();

  constructor(private treeQuery: TreeQuery) { }

  ngOnInit() {

  }

}
