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
import { TagsService } from "../tags/tags.service";
import { DocumentService } from "../../../../services/document/document.service";

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
  private tagsService = inject(TagsService);
  private documentService = inject(DocumentService);

  constructor() {
    super();
    this.fields.push({
      key: "date",
      type: "datepicker",
      props: {
        appearance: "outline",
      },
    });
    inject(PluginService).registerPlugin(this);

    effect(() => {
      if (!this.formRegistered) return;
      const doc = this.generalStore.getOpenedDocument(this.forAddress());
      this.formToolbarService.setButtonState(
        "toolBtnArchive",
        doc !== null &&
          doc._tags.split(",").indexOf("archived") === -1 &&
          doc.hasWritePermission,
      );
    });
  }

  registerForm() {
    super.registerForm();
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
              message: "Wollen Sie den Datensatz wirklich archivieren?",
              confirmButtonText: "Jetzt archivieren",
            },
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              const openedDocument = this.generalStore.getOpenedDocument(false);
              this.tagsService
                .addTags(openedDocument.id as number, ["archived"], false)
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
        this.tagsService
          .removeTags(openedDocument.id as number, ["archived"], false)
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
