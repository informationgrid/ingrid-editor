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

@Component({
  selector: 'ige-header-title-row',
  templateUrl: './header-title-row.component.html',
  styleUrls: ['./header-title-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderTitleRowComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() toggleMore = new EventEmitter();

  @ViewChild('titleInput', {static: true}) titleInput: ElementRef;

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
    this.toggleMore.next(this.showMore);
  }

  getIcon() {
    console.log('.');
    return this.profileService.getProfileIcon(this.form.get('_profile').value);
  }
}
