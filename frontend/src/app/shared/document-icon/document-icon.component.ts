/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, HostBinding, Input, OnChanges } from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { TreeNode } from "../../store/tree/tree-node.model";
import { TranslocoService } from "@ngneat/transloco";
import { DocumentState } from "../../models/ige-document";
import { ProfileService } from "../../services/profile.service";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { NgClass } from "@angular/common";

@Component({
  selector: "ige-document-icon",
  templateUrl: "./document-icon.component.html",
  styleUrls: ["./document-icon.component.scss"],
  standalone: true,
  imports: [MatTooltip, MatIcon, NgClass],
})
export class DocumentIconComponent implements OnChanges {
  tooltip: string;
  iconClass: string;

  @Input() doc: DocumentAbstract | TreeNode;

  @Input() showDelay: number = 0;
  @Input() toolTipModifier: (tooltip: string) => string = (tooltip) => tooltip;

  documentState: string;
  hasTags = false;

  @HostBinding("className") componentClass: string;

  constructor(
    private translocoService: TranslocoService,
    private profileService: ProfileService,
  ) {}

  updateDocumentState(doc: DocumentAbstract | TreeNode) {
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
      this.getIconFromProfile((<DocumentAbstract>doc)._type);
  }

  private getIconFromProfile(docType: string) {
    return this.profileService.getDocumentIcon(docType);
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
