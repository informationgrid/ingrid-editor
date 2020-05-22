import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../../models/ige-document';
import {ProfileService} from '../../../services/profile.service';

@Component({
  selector: 'ige-header-title-row-min',
  templateUrl: './header-title-row-min.component.html',
  styleUrls: ['./header-title-row-min.component.scss']
})
export class HeaderTitleRowMinComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Output() jumpToSection = new EventEmitter<number>();

  constructor(private profileService: ProfileService) {
  }

  ngOnInit(): void {
  }


  getIcon() {
    return this.profileService.getDocumentIcon(this.form.value);
  }

  // TODO: refactor since it's used in tree-component also
  getStateClass() {
    switch (this.model._state) {
      case 'W':
        return 'working';
      case 'PW':
        return 'workingWithPublished';
      case 'P':
        return 'published';
      default:
        console.error('State is not supported: ' + this.model._state);
        throw new Error('State is not supported: ' + this.model._state);
    }
  }
}
