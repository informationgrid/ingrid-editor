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
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { UntilDestroy } from "@ngneat/until-destroy";
import { CreateNodeComponent, CreateOptions } from "./create-node.component";
import { DocumentService } from "../../../services/document/document.service";
import { FormUtils } from "../../form.utils";
import { FormStateService } from "../../form-state.service";
import { ConfigService } from "../../../services/config/config.service";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { TranslocoService } from "@ngneat/transloco";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

@UntilDestroy()
@Injectable()
export class CreateDocumentPlugin extends Plugin {
  id = "plugin.newDoc";
  name = "Neues Dokument Plugin";
  description = "Ermöglicht das Anlegen eines neuen Dokuments";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  isAdmin = this.config.isAdmin();

  constructor(
    private config: ConfigService,
    private toolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog,
    private translocoService: TranslocoService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();
    this.initializeButton();

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent("NEW_DOC")
      .subscribe(() => this.newDoc());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private initializeButton() {
    this.translocoService
      .selectTranslate(
        this.forAddress ? "toolbar.newAddress" : "toolbar.newDocument",
      )
      .subscribe((tooltipText) => {
        console.log("init create doc button");
        this.toolbarService.addButton({
          id: "toolBtnNew",
          tooltip: tooltipText,
          matSvgVariable: "Neuer-Datensatz",
          eventId: "NEW_DOC",
          pos: 1,
          active: true,
        });
        this.addNonAdminBehaviour();
      });
  }

  async newDoc() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();

    if (selectedDoc) {
      let handled = await FormUtils.handleDirtyForm(
        this.formStateService.getForm(),
        this.documentService,
        this.dialog,
        this.forAddress,
      );

      if (!handled) {
        return;
      }
    }
    this.showDialog();
  }

  showDialog() {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 500,
      disableClose: false,
      hasBackdrop: true,
      data: {
        forAddress: this.forAddress,
        isFolder: false,
      } as CreateOptions,
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.toolbarService.removeButton("toolBtnNew");
    }
  }

  private addNonAdminBehaviour() {
    if (!this.isAdmin) {
      const canGenerallyCreate = this.config.hasPermission(
        this.forAddress ? "can_create_address" : "can_create_dataset",
      );
      this.toolbarService.setButtonState("toolBtnNew", canGenerallyCreate);

      if (!canGenerallyCreate && this.forAddress) {
        const organisationCheckSubscription = this.addressTreeQuery
          .selectActive()
          .subscribe((data) => {
            this.toolbarService.setButtonState(
              "toolBtnNew",
              this.isOrganisation(data),
            );
          });
        this.formSubscriptions.push(organisationCheckSubscription);
      }
    }
  }

  private isOrganisation(data: any[]) {
    return data.length === 1 && data[0]._type.endsWith("OrganisationDoc");
  }
}
