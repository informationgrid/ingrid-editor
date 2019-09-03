import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss']
})
export class FormInfoComponent implements OnInit {

  @Input() form: FormGroup;

  showDateBar;
  markFavorite;

  constructor() { }

  ngOnInit() {
  }

}
