import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { UntypedFormGroup } from "@angular/forms";
import { IgeDocument } from "../../../models/ige-document";
import { FormMenuService, FormularMenuItem } from "../../form-menu.service";

@Component({
  selector: "ige-header-title-row",
  templateUrl: "./header-title-row.component.html",
  styleUrls: ["./header-title-row.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderTitleRowComponent implements OnInit {
  @Input() set form(value: UntypedFormGroup) {
    this._form = value;
  }

  @Input() set model(value: IgeDocument) {
    this._model = value;
    this.updateHeaderMenuOptions();
  }

  @Input() disableEdit: boolean;
  @Input() address: boolean;

  @ViewChild("titleInput") titleInput: ElementRef;
  @ViewChild("cfcAutosize") contentFCAutosize: CdkTextareaAutosize;

  _form: UntypedFormGroup;
  _model: IgeDocument;
  showTitleInput = false;
  showMore = false;
  showMoreActions = false;

  moreActions: FormularMenuItem[];

  constructor(
    private cdRef: ChangeDetectorRef,
    private formMenuService: FormMenuService,
  ) {}

  ngOnInit() {
    this.updateHeaderMenuOptions();
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

  private updateHeaderMenuOptions() {
    this.moreActions = this.formMenuService.getMenuItems(
      this.address ? "address" : "dataset",
    );
    this.showMoreActions = this.moreActions.length > 0;
  }
}
