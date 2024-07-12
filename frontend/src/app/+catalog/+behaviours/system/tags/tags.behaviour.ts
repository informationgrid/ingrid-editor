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
import { inject, Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { TreeStore } from "../../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";
import { DocumentService } from "../../../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import {
  PublicationTypeDialog,
  PublicationTypeDialogOptions,
} from "./publication-type/publication-type.dialog";
import { filter } from "rxjs/operators";
import { FormMenuService, MenuId } from "../../../../+form/form-menu.service";
import { FormStateService } from "../../../../+form/form-state.service";
import { FormUtils } from "../../../../+form/form.utils";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { TagsService } from "./tags.service";

@Injectable()
export class TagsBehaviour extends Plugin {
  id = "plugin.tags";
  defaultActive = true;
  name = "Zuweisung von Tags";
  description =
    "Jedem Dokument kann ein oder mehrere Tags zugewiesen werden. Derzeit wird es nur verwendet, um einen Datensatz für die Indizierung zu markieren (Internet, Intranet, amtsintern)";
  eventAddTags = "ADD_TAGS";

  constructor(
    private formMenuService: FormMenuService,
    private docEvents: DocEventsService,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private formStateService: FormStateService,
    private tagsService: TagsService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  private menuId: MenuId;
  private menuItemId = "set-tags";

  registerForm() {
    super.registerForm();

    this.menuId = this.forAddress ? "address" : "dataset";
    this.formMenuService.addMenuItem(this.menuId, {
      title: "Veröffentlichungsrecht setzen ...",
      name: this.menuItemId,
      action: () =>
        this.docEvents.sendEvent({
          type: this.eventAddTags,
        }),
    });
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventAddTags)
      .subscribe(() => this.showTagsDialog());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  unregisterForm() {
    super.unregisterForm();
    if (this.isActive) {
      this.formMenuService.removeMenuItem(this.menuId, this.menuItemId);
    }
  }

  private async showTagsDialog() {
    const store = this.forAddress ? this.addressTreeStore : this.treeStore;
    const currentDocument = store.getValue().openedDocument;
    const helpText = this.forAddress
      ? "Eine Adresse darf in ihrem Veröffentlichungsrecht nicht weiter eingeschränkt sein als die Datensätze, in denen sie referenziert wird. Bitte prüfen Sie das Veröffentlichungsrecht der Datensätze."
      : "Bitte stellen Sie bei einer Veränderung des Veröffentlichungsrechts sicher, dass auch alle Referenzen das passende Veröffentlichungsrecht besitzen.";
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService,
      this.documentService,
      this.dialog,
      this.forAddress,
    );
    if (!handled) {
      return;
    }
    this.dialog
      .open(PublicationTypeDialog, {
        data: <PublicationTypeDialogOptions>{
          options: [
            { key: "internet", value: "Internet" },
            { key: "intranet", value: "Intranet" },
            { key: "amtsintern", value: "amtsintern" },
          ],
          current: currentDocument._tags ?? "",
          helpText: helpText,
        },
        delayFocusTrap: true,
        maxWidth: 600,
      })
      .afterClosed()
      .pipe(filter((item) => item))
      .subscribe((newTag) =>
        this.tagsService.updateTagForDocument(
          currentDocument,
          newTag,
          this.forAddress,
        ),
      );
  }
}
