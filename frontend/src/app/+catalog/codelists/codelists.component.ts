import {Component, OnInit} from '@angular/core';
import {CodelistService} from '../../services/codelist/codelist.service';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'ige-codelists',
  templateUrl: './codelists.component.html',
  styleUrls: ['./codelists.component.scss']
})
export class CodelistsComponent implements OnInit {
  codelists = this.codelistService.getAll();
  entries: CodelistEntry[];
  selectedCodelist: Codelist;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery) {
  }

  ngOnInit(): void {


  }

  updateCodelists() {

    this.codelistService.update()
      .subscribe(codelists => console.log('Updated codelists', codelists));

  }

  /*selectedCodelist(value: string) {
    this.entries = this.codelistQuery.getEntity(value).entries;
  }*/
}
