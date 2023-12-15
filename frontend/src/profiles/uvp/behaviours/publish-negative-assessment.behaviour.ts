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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { TreeQuery } from "../../../app/store/tree/tree.query";
import { FormMenuService, MenuId } from "../../../app/+form/form-menu.service";
import { Injectable } from "@angular/core";
import { filter } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import {
  PublicationTypeDialog,
  PublicationTypeDialogOptions,
} from "../../../app/+catalog/+behaviours/system/tags/publication-type/publication-type.dialog";
import { DocumentAbstract } from "../../../app/store/document/document.model";
import { TagsService } from "../../../app/+catalog/+behaviours/system/tags/tags.service";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";

@Injectable({ providedIn: "root" })
export class PublishNegativeAssessmentBehaviour extends Plugin {
  id = "plugin.publish.negative.assessment";
  name = "'Negative Vorprüfungen' veröffentlichen";
  description =
    "Es werden zusätzliche Formularfelder angezeigt, die für die vollständige Erfassung einer negativen Vorprüfung " +
    "benötigt werden. Die negativen Vorprüfungen werden nur im Portal angezeigt, wenn diese Option ausgewählt ist. " +
    "Bitte nach Änderung der Option die Seite neu laden.";
  defaultActive = false;
  group = "UVP";
  formMenuId: MenuId = "dataset";

  constructor(
    private documentTreeQuery: TreeQuery,
    private formMenuService: FormMenuService,
    private dialog: MatDialog,
    private tagsService: TagsService,
    private behaviourService: BehaviourService,
  ) {
    super();

    this.fields.push(
      {
        key: "onlyWithSpatial",
        type: "toggle",
        props: {
          label: "Nur mit Raumbezügen",
        },
      },
      {
        key: "controlledByDataset",
        type: "toggle",
        props: {
          label: "Veröffentlichung im Portal auf Datensatzebene steuern",
        },
      },
    );
  }

  registerForm() {
    super.registerForm();

    const isActive =
      this.behaviourService.getBehaviour("plugin.publish.negative.assessment")
        ?.data?.controlledByDataset ?? false;
    if (!isActive) return;

    const onDocLoad = this.documentTreeQuery.openedDocument$
      .pipe(filter((doc) => doc !== null))
      .subscribe((doc) => {
        const button = {
          title: "Veröffentlichung steuern",
          name: "control-assessment-by-dataset",
          action: () => this.showPublicationControlDialog(doc),
        };
        // refresh menu item
        this.removeMenuItem();

        if (doc._type === "UvpNegativePreliminaryAssessmentDoc") {
          this.formMenuService.addMenuItem(this.formMenuId, button);
        }
      });
    this.formSubscriptions.push(onDocLoad);
  }

  unregisterForm() {
    super.unregisterForm();
    this.removeMenuItem();
  }

  private removeMenuItem() {
    this.formMenuService.removeMenuItem(
      this.formMenuId,
      "control-assessment-by-dataset",
    );
  }

  private showPublicationControlDialog(doc: DocumentAbstract) {
    this.dialog
      .open(PublicationTypeDialog, {
        data: <PublicationTypeDialogOptions>{
          options: [
            {
              key: "internet",
              value: "Veröffentlichen",
            },
            {
              key: "negative-assessment-not-publish",
              value: "Nicht veröffentlichen",
            },
          ],
          current: doc._tags ?? "",
          title:
            "Veröffentlichung der negativen Vorprüfung im UVP-Portal steuern.",
          helpText: `
            <div><strong>Veröffentlichen:</strong> Bekanntgabe durch Veröffentlichung im UVP-Portal und interne Erfassung für die Berichtspflicht.</div>
            <div><strong>Nicht veröffentlichen:</strong> Andere Form der Bekanntgabe und nur intern für die Berichtspflicht erfassen.</div>
          `,
        },
      })
      .afterClosed()
      .subscribe((newTag: string) => {
        if (!newTag) return;
        this.tagsService.updateTagForDocument(doc, newTag);
      });
  }
}
