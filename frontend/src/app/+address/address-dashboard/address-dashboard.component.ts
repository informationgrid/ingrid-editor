import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {TreeQuery} from "../../store/tree/tree.query";

@Component({
  selector: 'ige-address-dashboard',
  templateUrl: './address-dashboard.component.html',
  styleUrls: ['./address-dashboard.component.scss']
})
export class AddressDashboardComponent implements OnInit {

  treeDocs: Observable<number> = this.treeQuery.selectCount();

  constructor(private treeQuery: TreeQuery) { }

  ngOnInit(): void {
  }

}
