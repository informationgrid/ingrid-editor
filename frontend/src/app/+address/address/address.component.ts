import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {FormPluginsService} from '../../+form/form-shared/form-plugins.service';
import {FormularService} from '../../+form/formular.service';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';

@Component({
  selector: 'ige-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  sidebarWidth = 20;
  form = new FormGroup({});
  fields: any;
  model: any;
  formOptions: any;
  updateTree: any;
  initialActiveNodeId: any;
  initialExpandNodes: any;

  constructor(private router: Router, private formPlugins: FormPluginsService, private formService: FormularService,
              private addressTreeStore: AddressTreeStore) {
    formPlugins.setAddressConfiguration();
  }

  ngOnInit() {
  }

  rememberSizebarWidth($event: any) {

  }

  handleSelection(selectedDocsId: string[]) {
    this.addressTreeStore.setActive(selectedDocsId);
  }

  handleLoad(selectedDocIds: string[]) {

    this.router.navigate(['/address', {id: selectedDocIds[0]}]);
  }

  storePath(path: string[]) {
    this.addressTreeStore.update({
      activePathTitles: path
    })
  }
}
