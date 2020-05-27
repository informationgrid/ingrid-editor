import {Component, OnInit} from '@angular/core';
import {DocumentAbstract} from '../../../../store/document/document.model';
import {Observable, Subject} from 'rxjs';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {AddressTreeQuery} from '../../../../store/address-tree/address-tree.query';
import {CodelistQuery} from '../../../../store/codelist/codelist.query';
import {CodelistService} from '../../../../services/codelist/codelist.service';
import {map} from 'rxjs/operators';

export interface ChooseAddressResponse {
  type: string,
  address: DocumentAbstract
}

@Component({
  selector: 'ige-choose-address-dialog',
  templateUrl: './choose-address-dialog.component.html',
  styleUrls: ['./choose-address-dialog.component.scss']
})
export class ChooseAddressDialogComponent implements OnInit {

  recentAddresses: Observable<DocumentAbstract[]> = new Subject();

  selection: DocumentAbstract;
  selectedType: string;


  types = this.codelistQuery.selectEntity('505').pipe(
    map(CodelistService.mapToSelectSorted)
  );

  disabledCondition: (TreeNode) => boolean = (node: TreeNode) => {
    return node.type === 'FOLDER';
  };

  constructor(private addressTreeQuery: AddressTreeQuery,
              private codelistQuery: CodelistQuery,
              private codelistService: CodelistService) {
  }

  ngOnInit(): void {

    this.codelistService.byId('505');
  }

  updateAddress(addressId: string, tree: string) {

    this.selection = this.addressTreeQuery.getEntity(addressId);

  }

  getResult(): ChooseAddressResponse {
    return {
      type: this.selectedType,
      address: this.selection
    };
  }
}
