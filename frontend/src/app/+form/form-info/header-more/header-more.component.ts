import {Component, Input, OnInit} from '@angular/core';
import {DocumentState, IgeDocument} from '../../../models/ige-document';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'ige-header-more',
  templateUrl: './header-more.component.html',
  styleUrls: ['./header-more.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({height: 0, opacity: 0}),
        animate('300ms', style({height: 114, opacity: 1}))
      ]),
      transition(':leave', [
        style({height: 114, opacity: 1}),
        animate('300ms', style({height: 0, opacity: 0}))
      ])
    ])
  ]
})
export class HeaderMoreComponent implements OnInit {

  @Input() model: IgeDocument;
  @Input() showMore = false;

  constructor() {
  }

  ngOnInit() {
  }

  getState(state: DocumentState) {
    switch (state) {
      case 'P':
        return 'Veröffentlicht';
      case 'W':
        return 'In Bearbeitung';
      case 'PW':
        return 'In Bearbeitung mit Veröffentlichung';
      default:
        throw new Error('State unknown: ' + state);
    }
  }
}
