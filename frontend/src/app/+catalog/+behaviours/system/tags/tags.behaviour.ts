import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { FormularService } from "../../../../+form/formular.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { TreeStore } from "../../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";
import { DocumentService } from "../../../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { PublicationTypeDialog } from "./publication-type/publication-type.dialog";
import { filter, switchMap } from "rxjs/operators";
import { FormPluginsService } from "../../../../+form/form-shared/form-plugins.service";

@Injectable()
export class TagsBehaviour extends Plugin {
  id = "plugin.tags";
  defaultActive = true;
  name = "Zuweisung von Tags";
  description =
    "Jedem Dokument kann ein oder mehrere Tags zugewiesen werden. Derzeit wird es nur verwendet, um einen Datensatz für die Indizierung zu markieren (Internet, Intranet, amtsintern)";
  eventAddTags = "ADD_TAGS";

  constructor(
    private formularService: FormularService,
    private docEvents: DocEventsService,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private documentService: DocumentService,
    private dialog: MatDialog
  ) {
    super();
    inject(FormPluginsService).registerPlugin(this);
  }

  register() {
    super.register();

    this.formularService.addExtraOption(
      {
        title: "Veröffentlichungsrecht setzen ...",
        name: "set-tags",
        action: () =>
          this.docEvents.sendEvent({
            type: this.eventAddTags,
          }),
      },
      this.forAddress
    );
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventAddTags)
      .subscribe(() => this.showTagsDialog());

    this.subscriptions.push(toolbarEventSubscription);
  }

  unregister() {
    super.unregister();
    this.formularService.removeExtraOption("set-tags", this.forAddress);
  }

  private showTagsDialog() {
    const store = this.forAddress ? this.addressTreeStore : this.treeStore;
    const currentDocument = store.getValue().openedDocument;

    this.dialog
      .open(PublicationTypeDialog, {
        data: currentDocument._tags ?? "",
      })
      .afterClosed()
      .pipe(
        filter((item) => item),
        switchMap((item) =>
          this.updatePublicationType(currentDocument.id as number, item)
        )
      )
      .subscribe(() => {
        this.documentService.reload$.next({
          uuid: currentDocument._uuid,
          forAddress: this.forAddress,
        });
      });
  }

  /*
   * We handle the "internet"-type as null-value, which is the default value and to be consistent
   */
  private updatePublicationType(id: number, result: string) {
    const values = ["intranet", "amtsintern"];
    let tagToAdd = [result];
    if (result === "internet") {
      tagToAdd = [];
    }

    return this.documentService.updateTags(
      id,
      {
        add: tagToAdd,
        remove: values.filter((item) => item !== result),
      },
      this.forAddress
    );
  }
}
