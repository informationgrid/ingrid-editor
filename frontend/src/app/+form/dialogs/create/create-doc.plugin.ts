import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
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
import { FormPluginsService } from "../../form-shared/form-plugins.service";

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
    private translocoService: TranslocoService
  ) {
    super();
    inject(FormPluginsService).registerPlugin(this);
  }

  register() {
    this.initializeButton();

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent("NEW_DOC")
      .subscribe(() => this.newDoc());

    this.subscriptions.push(toolbarEventSubscription);
  }

  private initializeButton() {
    this.translocoService
      .selectTranslate(
        this.forAddress ? "toolbar.newAddress" : "toolbar.newDocument"
      )
      .subscribe((tooltipText) => {
        const buttons = [
          {
            id: "toolBtnNew",
            tooltip: tooltipText,
            matSvgVariable: "Neuer-Datensatz",
            eventId: "NEW_DOC",
            pos: 1,
            active: true,
          },
        ];
        buttons.forEach((button) => this.toolbarService.addButton(button));
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
        this.forAddress
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

  unregister() {
    super.unregister();

    this.toolbarService.removeButton("toolBtnNew");
  }

  private addNonAdminBehaviour() {
    if (!this.isAdmin) {
      const canGenerallyCreate = this.config.hasPermission(
        this.forAddress ? "can_create_address" : "can_create_dataset"
      );
      this.toolbarService.setButtonState("toolBtnNew", canGenerallyCreate);

      if (!canGenerallyCreate && this.forAddress) {
        const organisationCheckSubscription = this.addressTreeQuery
          .selectActive()
          .subscribe((data) => {
            this.toolbarService.setButtonState(
              "toolBtnNew",
              this.isOrganisation(data)
            );
          });
        this.subscriptions.push(organisationCheckSubscription);
      }
    }
  }

  private isOrganisation(data: any[]) {
    return data.length === 1 && data[0]._type.endsWith("OrganisationDoc");
  }
}
