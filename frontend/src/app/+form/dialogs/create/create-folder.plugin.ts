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
import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { MatDialog } from "@angular/material/dialog";
import { CreateNodeComponent, CreateOptions } from "./create-node.component";
import { FormUtils } from "../../form.utils";
import { DocumentService } from "../../../services/document/document.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { FormStateService } from "../../form-state.service";
import { ConfigService } from "../../../services/config/config.service";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";
import { TranslocoService } from "@ngneat/transloco";
import { GeneralStore } from "../../../store/general.store";
import { TreeStore } from "../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";

@UntilDestroy()
@Injectable()
export class CreateFolderPlugin extends Plugin {
  id = "plugin.folder";
  name = "Folder Plugin";
  description = "Ermöglicht das Anlegen von Ordnern.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  private generalStore = inject(GeneralStore);
  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);

  eventCreateFolderId = "CREATE_FOLDER";

  private isAdmin = this.config.hasCatAdminRights();

  constructor(
    private config: ConfigService,
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog,
    private transloco: TranslocoService,
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
        this.forAddress ? "can_create_address" : "can_create_dataset",
      );
      this.formToolbarService.setButtonState("toolBtnFolder", buttonEnabled);
    }

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  async createFolder() {
    // show dialog where user can choose name of the folder and location
    // it can be created under the root node or another folder
    // TODO: parent node determination is the same as in new-doc plugin
    const selectedDoc = this.generalStore.getOpenedDocument(this.forAddress);

    // wait for entity in store, otherwise it could happen that the tree is being
    // loaded while we clicked on the create node button. In this case the function
    // getFirstParentFolder would throw an error
    if (selectedDoc) {
      let handled = await FormUtils.handleDirtyForm(
        this.formStateService,
        this.documentService,
        this.dialog,
        this.forAddress,
      );

      if (!handled) {
        return;
      }

      const store = this.forAddress
        ? this.addressTreeStore
        : this.documentTreeStore;

      let parentDocId = null;
      const folder = store.getFirstParentFolder(selectedDoc.id as number);
      if (folder !== null) {
        parentDocId = folder.id;
      }
      this.showDialog(parentDocId);
    } else {
      this.showDialog(null);
    }
  }

  showDialog(parentDocId: string) {
    this.dialog.open(CreateNodeComponent, {
      maxWidth: 600,
      disableClose: false,
      hasBackdrop: true,
      data: {
        parent: parentDocId,
        forAddress: this.forAddress,
        isFolder: true,
      } as CreateOptions,
      ariaLabel: this.transloco.translate("toolbar.newFolder"),
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnFolder");
    }
  }
}
