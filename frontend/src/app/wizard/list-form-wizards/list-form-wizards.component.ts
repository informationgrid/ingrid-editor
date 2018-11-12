import {Component, OnInit} from '@angular/core';
import {FormularService} from '../../services/formular/formular.service';
import {DocumentService} from '../../services/document/document.service';

@Component( {
  selector: 'ige-list-form-wizards',
  templateUrl: './list-form-wizards.component.html',
  styleUrls: ['./list-form-wizards.component.css']
} )
export class ListFormWizardsComponent implements OnInit {

  constructor(private formularService: FormularService, private storageService: DocumentService) {
  }

  ngOnInit() {
    this.storageService.afterLoadAndSet$.subscribe( data => {
    } );
  }

}
