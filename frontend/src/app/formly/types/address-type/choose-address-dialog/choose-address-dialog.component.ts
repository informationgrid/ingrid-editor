import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DocumentAbstract} from '../../../../store/document/document.model';
import {Observable, of} from 'rxjs';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {AddressTreeQuery} from '../../../../store/address-tree/address-tree.query';
import {CodelistQuery} from '../../../../store/codelist/codelist.query';
import {CodelistService} from '../../../../services/codelist/codelist.service';
import {map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AddressRef} from '../address-card/address-card.component';
import {SessionQuery} from '../../../../store/session.query';
import {DocumentService} from '../../../../services/document/document.service';

export interface ChooseAddressResponse {
  type: string,
  address: DocumentAbstract
}

@Component({
  selector: 'ige-choose-address-dialog',
  templateUrl: './choose-address-dialog.component.html',
  styleUrls: ['./choose-address-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseAddressDialogComponent implements OnInit, OnDestroy {

  selection: DocumentAbstract;
  selectedType: string;
  selectedNode: Observable<string>;
  recentAddresses$: Observable<DocumentAbstract[]>;


  types = this.codelistQuery.selectEntity('505').pipe(
    map(CodelistService.mapToSelectSorted)
  );

  disabledCondition: (TreeNode) => boolean = (node: TreeNode) => {
    return node.type === 'FOLDER';
  };

  constructor(private addressTreeQuery: AddressTreeQuery,
              @Inject(MAT_DIALOG_DATA) private address: AddressRef,
              private codelistQuery: CodelistQuery,
              private codelistService: CodelistService,
              private sessionQuery: SessionQuery,
              private documentService: DocumentService,
              private dlgRef: MatDialogRef<ChooseAddressDialogComponent>
  ) {
  }

  ngOnInit(): void {

    this.updateModel(this.address);
    this.codelistService.byId('505');
    this.recentAddresses$ = this.sessionQuery.recentAddresses$;


  }

  updateAddressTree(addressId: string) {
    this.selection = this.addressTreeQuery.getEntity(addressId);
  }

  updateAddressList(address: DocumentAbstract) {
    this.selection = address;
  }

  getResult(): void {
    this.documentService.addToRecentAdresses(this.selection);

    this.dlgRef.close({
      type: this.selectedType,
      address: this.selection
    });
  }

  private updateModel(address: AddressRef) {
    if (!address) {
      return;
    }

    this.selectedType = address.type;
    this.selectedNode = of(address.ref._id);
  }

  ngOnDestroy(): void {

  }
}
