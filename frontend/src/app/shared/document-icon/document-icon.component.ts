import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { TreeNode } from "../../store/tree/tree-node.model";
import { DocumentUtils } from "../../services/document.utils";
import { TranslocoService } from "@ngneat/transloco";
import { IgeDocument } from "../../models/ige-document";
import { ProfileService } from "../../services/profile.service";

@Component({
  selector: "ige-document-icon",
  templateUrl: "./document-icon.component.html",
  styleUrls: ["./document-icon.component.scss"],
})
export class DocumentIconComponent implements OnInit {
  _doc: any;
  tooltip: string;
  iconClass: string;

  @Input() set doc(value: any) {
    this._doc = value;
    this.updateDocumentState(value);
  }

  @Input() showDelay: number = 0;
  @Input() explicitTooltip: string;

  @Output() tooltipEmitter = new EventEmitter<string>();

  documentState: string;
  hasTags = false;

  @HostBinding("className") componentClass: string;

  constructor(
    private translocoService: TranslocoService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {}

  updateDocumentState(doc: DocumentAbstract | TreeNode) {
    const state = (<DocumentAbstract>doc)._state || (<TreeNode>doc).state;
    const type = (<DocumentAbstract>doc)._type || (<TreeNode>doc).type;
    const publicationType =
      (<DocumentAbstract>doc)._tags || (<TreeNode>doc).tags;

    this.documentState = DocumentUtils.getStateClass(
      state,
      type,
      publicationType,
    );
    this.hasTags = publicationType?.length > 0;
    this.tooltip = this.getTooltip(type, publicationType);
    this.iconClass =
      (<DocumentAbstract>doc).icon ||
      (<TreeNode>doc).iconClass ||
      this.getIconFromProfile(<IgeDocument>doc);
  }

  private getIconFromProfile(doc: IgeDocument) {
    return this.profileService.getDocumentIcon(doc);
  }

  private getTooltip(type: string, publicationType: string): string {
    let returnTooltip = this.translocoService.translate(`docType.${type}`);
    if (publicationType) {
      const pubTypeLocalized = this.translocoService.translate(
        `tags.${publicationType}`,
      );
      // in case publication type has been disabled then it should be set to an empty string to avoid the display
      // the tag, which is still set in backend
      if (pubTypeLocalized.trim().length !== 0) {
        returnTooltip += ` (${pubTypeLocalized})`;
      }
    }
    this.tooltipEmitter.emit(returnTooltip);
    return returnTooltip;
  }
}
