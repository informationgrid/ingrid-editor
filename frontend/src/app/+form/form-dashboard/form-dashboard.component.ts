import { Component, OnInit } from '@angular/core';
import {TreeQuery} from "../../store/tree/tree.query";
import {Observable} from "rxjs";
import {FormToolbarService} from "../form-shared/toolbar/form-toolbar.service";

@Component({
  selector: 'ige-form-dashboard',
  templateUrl: './form-dashboard.component.html',
  styleUrls: ['./form-dashboard.component.scss']
})
export class FormDashboardComponent implements OnInit {

  treeDocs: Observable<number> = this.treeQuery.selectCount();

  constructor(private treeQuery: TreeQuery,
              private formToolbarService: FormToolbarService) { }

  ngOnInit() {

  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next('CREATE_FOLDER');
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next('NEW_DOC');
  }

  importDataset() {
  }
}
