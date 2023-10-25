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

    const onDocLoad = this.documentTreeQuery.openedDocument$
      .pipe(filter((doc) => doc !== null))
      .subscribe((doc) => {
        const button = {
          title:
            "Veröffentlichung der negativen Vorprüfung im UVP-Portal steuern",
          name: "control-assessment-by-dataset",
          action: () => this.showPublicationControlDialog(doc),
        };
        // refresh menu item
        this.formMenuService.removeMenuItem(
          this.formMenuId,
          "control-assessment-by-dataset",
        );
        if (doc._type === "UvpNegativePreliminaryAssessmentDoc") {
          this.formMenuService.addMenuItem(this.formMenuId, button);
        }
      });
    this.formSubscriptions.push(onDocLoad);
  }

  private showPublicationControlDialog(doc: DocumentAbstract) {
    this.dialog
      .open(PublicationTypeDialog, {
        data: <PublicationTypeDialogOptions>{
          options: [
            {
              key: "internet",
              value:
                "Bekanntgabe durch Veröffentlichung im UVP-Portal und interne Erfassung für die Berichtspflicht",
            },
            {
              key: "intranet",
              value:
                "Andere Form der Bekanntgabe und nur intern für die Berichtspflicht erfassen",
            },
          ],
          current: doc._tags ?? "",
        },
      })
      .afterClosed()
      .subscribe((newTag: string) => {
        this.tagsService.updateTagForDocument(doc, newTag);
      });
  }
}
