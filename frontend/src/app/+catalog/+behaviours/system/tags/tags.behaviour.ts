import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { FormularService } from "../../../../+form/formular.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { TreeStore } from "../../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";
import { DocumentService } from "../../../../services/document/document.service";

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
    private documentService: DocumentService
  ) {
    super();
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

  private showTagsDialog() {
    console.log("show tags");

    const store = this.forAddress ? this.addressTreeStore : this.treeStore;
    const currentDocument = store.getValue().openedDocument;

    this.documentService
      .updateTags(
        currentDocument.id as number,
        {
          add: ["intranet"],
          remove: ["internet", "amtsintern"],
        },
        this.forAddress
      )
      .subscribe();
  }
}
