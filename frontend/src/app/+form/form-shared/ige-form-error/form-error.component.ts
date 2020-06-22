import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-form-error',
  templateUrl: './ige-form-error.component.html',
  styleUrls: ['./ige-form-error.component.scss']
})
export class FormErrorComponent implements OnInit {

  @Input() message: string;

  constructor() { }

  ngOnInit(): void {
  }

}
