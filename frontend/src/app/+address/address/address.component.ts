import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';

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

  constructor(private router: Router) { }

  ngOnInit() {
  }

  rememberSizebarWidth($event: any) {

  }

  handleSelection($event: string[]) {

  }

  handleLoad(selectedDocIds: string[]) {

    this.router.navigate(['/address', {id: selectedDocIds[0]}]);
  }

  storePath($event: string[]) {

  }
}
