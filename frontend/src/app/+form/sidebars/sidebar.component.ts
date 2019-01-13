import { Component, OnInit } from '@angular/core';
import {SelectedDocument} from "./selected-document.model";
import {FormularService} from "../../services/formular/formular.service";
import {Router} from "@angular/router";
import {DocumentAbstract} from "../../store/document/document.model";
import {DocumentStore} from "../../store/document/document.store";

@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private formularService: FormularService, private router: Router, private documentStore: DocumentStore) { }

  ngOnInit() {
  }

  handleLoad(selectedDocs: SelectedDocument[]) { // id: string, profile?: string, forceLoad?: boolean) {
    // when multiple nodes were selected then do not show any form
    if (selectedDocs.length !== 1) {
      return;
    }

    const doc = selectedDocs[0];

    // if a folder was selected then normally do not show the form
    // show folder form only if the edit button was clicked which adds the forceLoad option
    if (doc.profile === 'FOLDER' && !doc.editable) {
      return;
    }

    // this.documentStore.setOpenedDocument(doc);
    this.router.navigate( ['/form', {id: doc.id}] );
  }

  handleSelection(selectedDocs: DocumentAbstract[]) {
    this.documentStore.setSelected(selectedDocs);

    // when multiple nodes were selected then do not show any form
    // TODO: update ui store for form
    /*if (this.form) {
      if (selectedDocs.length !== 1 && this.form.enabled) {
        this.form.disable();
      } else if (this.form.disabled) {
        this.form.enable();
      }
    }*/
  }

}
