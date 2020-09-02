import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormGroup} from '@angular/forms';
import {ProfileService} from '../../../services/profile.service';
import {IgeDocument} from '../../../models/ige-document';
import {DocumentUtils} from '../../../services/document.utils';

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
  @Input() disableEdit: boolean;

  @ViewChild('titleInput') titleInput: ElementRef;
  @ViewChild('cfcAutosize') contentFCAutosize: CdkTextareaAutosize;

  showTitleInput = false;
  showMore = false;

  constructor(private cdRef: ChangeDetectorRef, private profileService: ProfileService) {
  }

  ngOnInit() {
  }

  editTitle() {
    this.showTitleInput = !this.showTitleInput;
    this.cdRef.detectChanges();
    this.contentFCAutosize.resizeToFitContent(true);
    this.titleInput.nativeElement.focus();
  }

  toggleMoreInfo() {
    this.showMore = !this.showMore;
  }

  getIcon() {
    return this.profileService.getDocumentIcon(this.form.value);
  }

  getStateClass() {
    return DocumentUtils.getStateClass(this.model._state, this.model._type);
  }
}
