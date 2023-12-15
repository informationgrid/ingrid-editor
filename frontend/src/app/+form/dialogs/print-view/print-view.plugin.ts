/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import { PrintViewDialogComponent } from "./print-view-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { ProfileService } from "../../../services/profile.service";
import { DocumentDataService } from "../../../services/document/document-data.service";
import { combineLatest, of } from "rxjs";
import { clone, JsonDiffMerge } from "../../../shared/utils";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

@UntilDestroy()
@Injectable()
export class PrintViewPlugin extends Plugin {
  id = "plugin.printView";
  name = "Vorschau";
  description =
    "Fügt einen Button hinzu, um sich eine Vorschau anzeigen zu lassen.";
  group = "Toolbar";
  defaultActive = true;

  private treeQuery: TreeQuery | AddressTreeQuery;

  constructor(
    private documentDataService: DocumentDataService,
    private toolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private docTreeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private dialog: MatDialog,
    private profileService: ProfileService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    // add button to toolbar
    const buttons: Array<ToolbarItem | Separator> = [
      // { id: 'toolBtnCopyCutSeparator', pos: 60, isSeparator: true },
      {
        id: "toolBtnPrint",
        tooltip: "Vorschau",
        matSvgVariable: "Vorschau-Druckansicht",
        eventId: "PRINT",
        pos: 20,
        active: false,
      },
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button));

    this.treeQuery = this.forAddress
      ? this.addressTreeQuery
      : this.docTreeQuery;

    this.formSubscriptions.push(
      // react on event when button is clicked
      this.docEvents.onEvent("PRINT").subscribe(() => this.showPrintDialog()),

      this.treeQuery.openedDocument$
        .pipe(untilDestroyed(this))
        .subscribe((openedDoc) => {
          this.toolbarService.setButtonState(
            "toolBtnPrint",
            openedDoc !== null && openedDoc._type != "FOLDER",
          );
        }),
    );
  }

  private showPrintDialog() {
    let openedDocument = this.treeQuery.getOpenedDocument();
    const type = openedDocument._type;
    const profile = this.profileService.getProfile(type);

    combineLatest([
      this.documentDataService.load(openedDocument._uuid, true),
      openedDocument._state === "PW"
        ? this.documentDataService.loadPublished(openedDocument._uuid, true)
        : of(null),
    ]).subscribe(([current, published]) => {
      let fields;
      let fieldsPublished = null;
      if (published !== null) {
        const diff = JsonDiffMerge.jsonDiff(current, published, {});
        fields = profile.getFieldsForPrint(diff);
        fieldsPublished = clone(fields);
      } else {
        fields = profile.getFieldsForPrint(null);
      }
      this.dialog.open(PrintViewDialogComponent, {
        width: "80%",
        data: {
          fields: fields,
          fieldsPublished: fieldsPublished,
          model: current,
          modelPublished: published,
        },
      });
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.toolbarService.removeButton("toolBtnPrint");
    }
  }
}
