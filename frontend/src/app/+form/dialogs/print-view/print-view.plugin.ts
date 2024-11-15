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
import { effect, inject, Injectable } from "@angular/core";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import { PrintViewDialogComponent } from "./print-view-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { ProfileService } from "../../../services/profile.service";
import { DocumentDataService } from "../../../services/document/document-data.service";
import { combineLatest, of } from "rxjs";
import { clone, JsonDiffMerge } from "../../../shared/utils";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GeneralStore } from "../../../store/general.store";

@UntilDestroy()
@Injectable()
export class PrintViewPlugin extends Plugin {
  id = "plugin.printView";
  name = "Vorschau";
  description =
    "Fügt einen Button hinzu, um sich eine Vorschau anzeigen zu lassen.";
  group = "Toolbar";
  defaultActive = true;

  private generalStore = inject(GeneralStore);

  constructor(
    private documentDataService: DocumentDataService,
    private toolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private profileService: ProfileService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);

    effect(() => {
      if (!this.formRegistered) return;
      const doc = this.generalStore.getOpenedDocument(this.forAddress());
      this.toolbarService.setButtonState(
        "toolBtnPrint",
        doc !== null && doc._type != "FOLDER",
      );
    });
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
    buttons.forEach((button) => this.toolbarService.addButton(button));

    this.formSubscriptions.push(
      // react on event when button is clicked
      this.docEvents.onEvent("PRINT").subscribe(() => this.showPrintDialog()),
    );
  }

  private showPrintDialog() {
    let openedDocument = this.generalStore.getOpenedDocument(this.forAddress());
    const type = openedDocument._type;
    const profile = this.profileService.getProfile(type);

    combineLatest([
      this.documentDataService.load(openedDocument._uuid, true),
      openedDocument._state === "PW"
        ? this.documentDataService.loadPublished(openedDocument._uuid, true)
        : of(null),
    ]).subscribe(([current, published]) => {
      let fields: FormlyFieldConfig[];
      let fieldsPublished = null;
      if (published !== null) {
        const diff = JsonDiffMerge.jsonDiff(
          current.documentWithMetadata,
          published.documentWithMetadata,
          {},
        );
        fields = profile.getFieldsForPrint(diff);
        fieldsPublished = clone(fields);
      } else {
        fields = profile.getFieldsForPrint(null);
      }
      this.dialog.open(PrintViewDialogComponent, {
        width: "80%",
        maxWidth: "90vw",
        data: {
          fields: fields,
          fieldsPublished: fieldsPublished,
          model: current.documentWithMetadata,
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
