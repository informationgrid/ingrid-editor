import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CodelistEntry} from '../../../store/codelist/codelist.model';

@Component({
  selector: 'ige-update-codelist',
  templateUrl: './update-codelist.component.html',
  styleUrls: ['./update-codelist.component.scss']
})
export class UpdateCodelistComponent implements OnInit {
  model: any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public entry: CodelistEntry) {
    this.model = {...entry};
  }

  ngOnInit(): void {
  }

}
