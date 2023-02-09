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
import { ProfileService } from "../../../services/profile.service";
import { IgeDocument } from "../../../models/ige-document";
import { DocumentUtils } from "../../../services/document.utils";
import { ConfigService } from "../../../services/config/config.service";
import { DocEventsService } from "../../../services/event/doc-events.service";

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
    this.stateClass = this.getStateClass(value);
    this.icon = this.getIcon(value);
  }

  @Input() disableEdit: boolean;
  @Input() address: boolean;

  @ViewChild("titleInput") titleInput: ElementRef;
  @ViewChild("cfcAutosize") contentFCAutosize: CdkTextareaAutosize;

  _form: UntypedFormGroup;
  _model: IgeDocument;
  stateClass: string;
  icon: string;
  showTitleInput = false;
  showMore = false;
  showMoreActions = false;

  // TODO: fill more actions by a service
  moreActions = [
    {
      title: "Adresse ersetzen",
      name: "replace-address",
      action: () =>
        this.docEventsService.sendEvent({
          type: "REPLACE_ADDRESS",
          data: { uuid: this._model._uuid },
        }),
    },
  ];

  constructor(
    private cdRef: ChangeDetectorRef,
    private profileService: ProfileService,
    private configService: ConfigService,
    private docEventsService: DocEventsService
  ) {}

  ngOnInit() {
    const role = this.configService.$userInfo.value.role;
    const isPrivileged = role === "ige-super-admin" || role === "cat-admin";
    this.showMoreActions = this.address && isPrivileged;
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

  private getIcon(doc: IgeDocument) {
    return this.profileService.getDocumentIcon(doc);
  }

  private getStateClass(model) {
    return DocumentUtils.getStateClass(model._state, model._type);
  }
}
