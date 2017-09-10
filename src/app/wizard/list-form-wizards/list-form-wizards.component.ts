import {Component, OnInit} from '@angular/core';
import {FormularService} from '../../services/formular/formular.service';
import {StorageService} from '../../services/storage/storage.service';
import {DocumentInterface} from '../../services/storage/storage.dummy.service';

@Component( {
  selector: 'ige-list-form-wizards',
  templateUrl: './list-form-wizards.component.html',
  styleUrls: ['./list-form-wizards.component.css']
} )
export class ListFormWizardsComponent implements OnInit {

  data: DocumentInterface = null;

  constructor(private formularService: FormularService, private storageService: StorageService) {
  }

  ngOnInit() {
    this.storageService.afterLoadAndSet$.subscribe( data => {
      this.data = data;
    } );
  }

}
