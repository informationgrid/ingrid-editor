/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import { effect, inject, Injectable, signal } from "@angular/core";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { FormToolbarService } from "../../../../+form/form-shared/toolbar/form-toolbar.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../../../../services/document/document.service";
import { TranslocoService } from "@jsverse/transloco";
import { ConfigService } from "../../../../services/config/config.service";

@Injectable()
export class ArchivePlugin extends Plugin {
  id = "plugin.archive";
  name = "Archivierung";
  description = "Datensätze können archiviert werden.";
  group = "Datensätze";
  defaultActive = false;
  hide = false;
  hideInAddress = true;

  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  private documentService = inject(DocumentService);
  private transloco = inject(TranslocoService);
  private configService = inject(ConfigService);

  constructor() {
    super();

    this.fields.push({
      fieldGroupClassName: "flex-col",
      fieldGroup: [
        {
          key: "hideForAuthors",
          type: "checkbox",
          wrappers: [],
          defaultValue: false,
          props: {
            label: "Für Autoren nicht anzeigen",
          },
        },
        {
          key: "showInPortal",
          type: "checkbox",
          wrappers: [],
          defaultValue: false,
          props: {
            label: "archivierte Datensätze im Portal anzeigen",
          },
        },
      ],
    });

    inject(PluginService).registerPlugin(this);

    effect(() => {
      if (!this.formRegistered) return;
      const doc = this.generalStore.getOpenedDocument(this.forAddress());
      this.formToolbarService.setButtonState(
        "toolBtnArchive",
        DocumentService.canWriteDocument(doc),
      );
    });
  }

  register() {
    DocumentService.archivePluginActive = true;
  }

  unregister() {
    DocumentService.archivePluginActive = false;
  }

  registerForm() {
    super.registerForm();

    if (this.data.hideForAuthors && this.configService.isAuthor()) return;

    this.formToolbarService.addButton({
      id: "toolBtnArchive",
      label: "Archivieren",
      eventId: "ARCHIVE",
      pos: 18,
      active: signal(false),
      align: "right",
    });

    const toolbarEventSubscription = this.docEvents
      .onEvent("ARCHIVE")
      .subscribe(() => {
        this.dialog
          .open(ConfirmDialogComponent, {
            data: <ConfirmDialogData>{
              title: "Archivieren",
              message: this.transloco.translate("archive.message"),
              confirmButtonText: "Jetzt archivieren",
            },
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              const openedDocument = this.generalStore.getOpenedDocument(false);
              this.documentService
                .archive(openedDocument.id as number)
                .subscribe(() => {
                  this.documentService.reload$.next({
                    uuid: openedDocument._uuid,
                    forAddress: false,
                  });
                });
            }
          });
      });

    const unArchiveSubscription = this.docEvents
      .onEvent("UNARCHIVE")
      .subscribe(() => {
        const openedDocument = this.generalStore.getOpenedDocument(false);
        this.documentService
          .unarchive(openedDocument.id as number)
          .subscribe(() => {
            this.documentService.reload$.next({
              uuid: openedDocument._uuid,
              forAddress: false,
            });
          });
      });

    this.formSubscriptions.push(
      toolbarEventSubscription,
      unArchiveSubscription,
    );
  }

  unregisterForm() {
    super.unregisterForm();
    this.formToolbarService.removeButton("toolBtnArchive");
  }
}
