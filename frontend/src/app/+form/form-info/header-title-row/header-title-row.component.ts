import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ProfileService} from '../../../services/profile.service';
import {IgeDocument} from "../../../models/ige-document";

@Component({
  selector: 'ige-header-title-row',
  templateUrl: './header-title-row.component.html',
  styleUrls: ['./header-title-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderTitleRowComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[];

  @Output() jumpToSection = new EventEmitter();

  @ViewChild('titleInput') titleInput: ElementRef;

  showTitleInput = false;
  showMore = false;

  constructor(private cdRef: ChangeDetectorRef, private profileService: ProfileService) {
  }

  ngOnInit() {
  }

  editTitle() {
    this.showTitleInput = !this.showTitleInput;
    this.cdRef.detectChanges();
    this.titleInput.nativeElement.focus();
  }

  toggleMoreInfo() {
    this.showMore = !this.showMore;
  }

  getIcon() {
    return this.profileService.getProfileIcon(this.form.get('_profile').value);
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
