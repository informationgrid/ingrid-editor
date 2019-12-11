import {Component, Input, OnInit} from '@angular/core';
import {DocumentState, IgeDocument} from '../../../models/ige-document';

@Component({
  selector: 'ige-header-more',
  templateUrl: './header-more.component.html',
  styleUrls: ['./header-more.component.scss']
})
export class HeaderMoreComponent implements OnInit {

  @Input() model: IgeDocument;

  constructor() { }

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
