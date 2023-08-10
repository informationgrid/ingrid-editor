import { inject, Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { TreeStore } from "../../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";
import { DocumentService } from "../../../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { PublicationTypeDialog } from "./publication-type/publication-type.dialog";
import { filter, switchMap } from "rxjs/operators";
import { FormMenuService, MenuId } from "../../../../+form/form-menu.service";
import { FormStateService } from "../../../../+form/form-state.service";
import { FormUtils } from "../../../../+form/form.utils";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

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
    private formStateService: FormStateService
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
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.forAddress
    );
    if (!handled) {
      return;
    }
    this.dialog
      .open(PublicationTypeDialog, {
        data: currentDocument._tags ?? "",
        restoreFocus: true,
        delayFocusTrap: true,
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
