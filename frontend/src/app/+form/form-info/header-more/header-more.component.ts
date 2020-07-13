import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {DocumentState, IgeDocument} from '../../../models/ige-document';
import {animate, style, transition, trigger} from '@angular/animations';
import {DocumentUtils} from '../../../services/document.utils';
import {ProfileQuery} from '../../../store/profile/profile.query';

@Component({
  selector: 'ige-header-more',
  templateUrl: './header-more.component.html',
  styleUrls: ['./header-more.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({height: 0, opacity: 0}),
        animate('300ms', style({height: 134, opacity: 1}))
      ]),
      transition(':leave', [
        style({height: 134, opacity: 1}),
        animate('300ms', style({height: 0, opacity: 0}))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderMoreComponent implements OnInit {

  @Input() model: IgeDocument;
  @Input() showMore = false;

  constructor(private profileQuery: ProfileQuery) {
  }

  ngOnInit() {
  }

  getState(state: DocumentState) {

    return DocumentUtils.getStateName(state);

  }

  mapDocumentType(type: string) {

    return this.profileQuery.getEntity(type).label;

  }
}
