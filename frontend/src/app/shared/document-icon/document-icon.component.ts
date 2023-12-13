import { Component, HostBinding, Input, OnChanges } from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { TreeNode } from "../../store/tree/tree-node.model";
import { TranslocoService } from "@ngneat/transloco";
import { DocumentState, IgeDocument } from "../../models/ige-document";
import { ProfileService } from "../../services/profile.service";

@Component({
  selector: "ige-document-icon",
  templateUrl: "./document-icon.component.html",
  styleUrls: ["./document-icon.component.scss"],
})
export class DocumentIconComponent implements OnChanges {
  tooltip: string;
  iconClass: string;

  @Input() doc: Partial<IgeDocument> | DocumentAbstract | TreeNode;

  @Input() showDelay: number = 0;
  @Input() toolTipModifier: (tooltip: string) => string = (tooltip) => tooltip;

  documentState: string;
  hasTags = false;

  @HostBinding("className") componentClass: string;

  constructor(
    private translocoService: TranslocoService,
    private profileService: ProfileService,
  ) {}

  updateDocumentState(doc: Partial<IgeDocument> | DocumentAbstract | TreeNode) {
    const state = (<DocumentAbstract>doc)._state || (<TreeNode>doc).state;
    const type = (<DocumentAbstract>doc)._type || (<TreeNode>doc).type;
    const publicationType =
      (<DocumentAbstract>doc)._tags || (<TreeNode>doc).tags;

    this.documentState = this.getStateClass(state, type, publicationType);
    this.hasTags = publicationType?.length > 0;
    const tooltip = this.getTooltip(type, state, publicationType);
    this.tooltip = this.toolTipModifier?.(tooltip) || tooltip;
    this.iconClass =
      (<DocumentAbstract>doc).icon ||
      (<TreeNode>doc).iconClass ||
      this.getIconFromProfile(<IgeDocument>doc);
  }

  private getIconFromProfile(doc: IgeDocument) {
    return this.profileService.getDocumentIcon(doc);
  }

  private getTooltip(
    type: string,
    state: DocumentState,
    publicationType: string,
  ): string {
    const tooltipDocType = this.translocoService.translate(`docType.${type}`);

    const tooltipState = this.translocoService.translate(`docState.${state}`);

    let tooltipPubTyp = "";
    if (publicationType) {
      const pubTypeLocalized = this.translocoService.translate(
        `tags.${publicationType}`,
      );
      // in case publication type has been disabled then it should be set to an empty string to avoid the display
      // the tag, which is still set in backend
      if (pubTypeLocalized.trim().length !== 0) {
        tooltipPubTyp = `, ${pubTypeLocalized}`;
      }
    }

    return type == "FOLDER" || state == null
      ? tooltipDocType
      : `${tooltipDocType} (${tooltipState}${tooltipPubTyp})`;
  }

  private getStateClass(state: DocumentState, type: string, tags: string) {
    let mappedState = this.mapIconState(state, type);

    const mappedTags = tags?.replaceAll(",", " ") ?? "";
    return `${mappedState} ${mappedTags}`;
  }

  private mapIconState(state: DocumentState, type: string) {
    switch (state) {
      case "W":
        return type === "FOLDER" ? "published" : "working";
      case "PW":
        return "workingWithPublished";
      case "P":
      case "PENDING":
        return "published";
      default:
        console.error("State is not supported: " + state);
        return "";
    }
  }

  ngOnChanges() {
    this.updateDocumentState(this.doc);
  }
}
