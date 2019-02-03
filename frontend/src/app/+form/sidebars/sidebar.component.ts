import { Component, OnInit } from '@angular/core';
import {SelectedDocument} from "./selected-document.model";
import {FormularService} from "../../services/formular/formular.service";
import {Router} from "@angular/router";
import {DocumentAbstract} from "../../store/document/document.model";
import {DocumentStore} from "../../store/document/document.store";
import {TreeQuery} from "../../store/tree/tree.query";
import {TreeStore} from "../../store/tree/tree.store";

@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  sideTab;
  load;

  constructor(private formularService: FormularService, private router: Router,
              private treeQuery: TreeQuery, private treeStore: TreeStore) { }

  ngOnInit() {
  }

  handleLoad(selectedDocs: DocumentAbstract[]) { // id: string, profile?: string, forceLoad?: boolean) {
    // when multiple nodes were selected then do not show any form
    if (selectedDocs.length !== 1) {
      return;
    }

    const doc = selectedDocs[0];

    // if a folder was selected then normally do not show the form
    // show folder form only if the edit button was clicked which adds the forceLoad option
    if (doc._profile === 'FOLDER') { // && !doc.editable) {
      return;
    }

    // this.documentStore.setOpenedDocument(doc);
    this.router.navigate( ['/form', {id: doc.id}] );
  }

  handleSelection(selectedDocsId: string[]) {
    // TODO: Refactor this to the parent component so that the parent can decide
    //       which store to update
    if (selectedDocsId.length === 1) {
      let selectedDocuments = selectedDocsId.map( id => this.treeQuery.getEntity(id));
      this.treeStore.setOpenedDocument(selectedDocuments[0]);
    }
    this.treeStore.setActive(selectedDocsId);

    // this.documentStore.setSelected(selectedDocs);

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
