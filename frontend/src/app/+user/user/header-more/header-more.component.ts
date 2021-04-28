import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {DocumentState, IgeDocument} from '../../../models/ige-document';
import {animate, style, transition, trigger} from '@angular/animations';
import {DocumentUtils} from '../../../services/document.utils';
import {ProfileQuery} from '../../../store/profile/profile.query';
import {FrontendUser} from "../../user";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'user-header-more',
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

  @Input() user: FrontendUser;
  @Input() allUsers: FrontendUser[];
  @Input() admins: FrontendUser[];
  @Input() form: FormGroup;
  @Input() showMore = false;
  standinUsers: String[];

  constructor(private profileQuery: ProfileQuery) {
  }

  ngOnInit() {
    this.standinUsers = this.getStandinUsers()
  }

  getStandinUsers(): String[]{
    // TODO implement
    return ["User1","user2"]
  }

  getCreationDate() {
    // TODO implement
    return ""
  }

  getModificationDate() {
    // TODO implement
    return ""
  }
}
