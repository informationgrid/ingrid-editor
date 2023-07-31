import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { CreateNodeComponent, CreateOptions } from "./create-node.component";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { filter, take } from "rxjs/operators";
import { FormUtils } from "../../form.utils";
import { DocumentService } from "../../../services/document/document.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FormStateService } from "../../form-state.service";
import { ConfigService } from "../../../services/config/config.service";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

@UntilDestroy()
@Injectable()
export class CreateFolderPlugin extends Plugin {
  id = "plugin.folder";
  name = "Folder Plugin";
  description = "Ermöglicht das Anlegen von Ordnern.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  eventCreateFolderId = "CREATE_FOLDER";

  private isAdmin = this.config.isAdmin();

  constructor(
    private config: ConfigService,
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: "toolBtnFolder",
      tooltip: "Ordner erstellen",
      matSvgVariable: "outline-create_new_folder-24px",
      eventId: this.eventCreateFolderId,
      pos: 10,
      active: true,
    });

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventCreateFolderId)
      .subscribe(() => this.createFolder());

    if (!this.isAdmin) {
      const buttonEnabled = this.config.hasPermission(
        this.forAddress ? "can_create_address" : "can_create_dataset"
      );
      this.formToolbarService.setButtonState("toolBtnFolder", buttonEnabled);
    }

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  async createFolder() {
    // show dialog where user can choose name of the folder and location
    // it can be created under the root node or another folder
    // TODO: parent node determination is the same as in new-doc plugin
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();

    // wait for entity in store, otherwise it could happen that the tree is being
    // loaded while we clicked on the create node button. In this case the function
    // getFirstParentFolder would throw an error
    if (selectedDoc) {
      let handled = await FormUtils.handleDirtyForm(
        this.formStateService.getForm(),
        this.documentService,
        this.dialog,
        this.forAddress
      );

      if (!handled) {
        return;
      }

      query
        .selectEntity(selectedDoc.id)
        .pipe(
          untilDestroyed(this),
          filter((entity) => entity !== undefined),
          take(1)
        )
        .subscribe((entity) => {
          let parentDocId = null;
          const folder = query.getFirstParentFolder(selectedDoc.id.toString());
          if (folder !== null) {
            parentDocId = folder.id;
          }
          this.showDialog(parentDocId);
        });
    } else {
      this.showDialog(null);
    }
  }

  showDialog(parentDocId: string) {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 500,
      disableClose: false,
      hasBackdrop: true,
      data: {
        parent: parentDocId,
        forAddress: this.forAddress,
        isFolder: true,
      } as CreateOptions,
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnFolder");
    }
  }
}
