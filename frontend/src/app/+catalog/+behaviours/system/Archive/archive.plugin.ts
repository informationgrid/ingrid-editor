import { inject, Injectable } from "@angular/core";
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

@Injectable()
export class ArchivePlugin extends Plugin {
  id = "plugin.archive";
  name = "Archivierung";
  description = "Datensätze können archiviert werden.";
  group = "Datensätze";
  defaultActive = false;
  hide = false;

  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  private tagsService = inject(TagsService);

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
  }

  registerForm() {
    super.registerForm();
    this.formToolbarService.addButton({
      id: "toolBtnArchive",
      label: "Archivieren",
      eventId: "ARCHIVE",
      pos: 18,
      active: true,
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
              this.tagsService.addAdditionalTags(["archived"]);
              this.tagsService
                .updatePublicationType(
                  this.generalStore.getOpenedDocument(false).id as number,
                  "archived",
                  false,
                )
                .subscribe();
            }
          });
      });

    this.formSubscriptions.push(toolbarEventSubscription);
  }
}
