import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormToolbarService} from '../../+form/form-shared/toolbar/form-toolbar.service';
import {AddressTreeQuery} from '../../store/address-tree/address-tree.query';

@Component({
  selector: 'ige-address-dashboard',
  templateUrl: './address-dashboard.component.html',
  styleUrls: ['./address-dashboard.component.scss']
})
export class AddressDashboardComponent implements OnInit {

  treeDocs: Observable<number> = this.treeQuery.selectCount();

  constructor(private treeQuery: AddressTreeQuery,
              private formToolbarService: FormToolbarService) { }

  ngOnInit(): void {
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next('CREATE_FOLDER');
  }

  createNewAddress() {
    this.formToolbarService.toolbarEvent$.next('NEW_DOC');
  }
}
