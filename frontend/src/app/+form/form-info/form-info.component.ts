import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss']
})
export class FormInfoComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];

  showDateBar;
  markFavorite;
  showMore = false;

  constructor() { }

  ngOnInit() {
  }

}
