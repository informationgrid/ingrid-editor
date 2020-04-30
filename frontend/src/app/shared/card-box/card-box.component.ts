import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-card-box',
  templateUrl: './card-box.component.html',
  styleUrls: ['./card-box.component.scss']
})
export class CardBoxComponent implements OnInit {
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

}
