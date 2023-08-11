import { inject, Injectable } from "@angular/core";
import { DocumentService } from "../../../services/document/document.service";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import {
  PasteDialogComponent,
  PasteDialogOptions,
} from "./paste-dialog.component";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { delay, filter, switchMap, tap } from "rxjs/operators";
import { ID } from "@datorama/akita";
import { ConfigService } from "../../../services/config/config.service";
import { FormUtils } from "../../form.utils";
import { FormStateService } from "../../form-state.service";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Router } from "@angular/router";
import { IgeDocument } from "../../../models/ige-document";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

@Injectable()
export class CopyCutPastePlugin extends Plugin {
  id = "plugin.copy.cut.paste";
  name = "Copy Cut Paste";
  description =
    "Ein Button für das Kopieren und Ausschneiden sowie das Einfügen von Datensätzen.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  private query: TreeQuery | AddressTreeQuery;

  // event element needs to be passed for restoring focus correctly,
  // see https://github.com/angular/components/issues/17962
  private eventEl: HTMLElement;

  // create extended onEvent to store event element
  private onEvent(id: string) {
    return this.docEvents
      .onEvent(id)
      .pipe(tap((event) => (this.eventEl = event.data?.eventEl)));
  }

  isAdmin = this.config.isAdmin();

  constructor(
    private config: ConfigService,
    private toolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private dialog: MatDialog,
    private router: Router
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    const buttons: Array<ToolbarItem | Separator> = [
      { id: "toolBtnCopyCutSeparator", pos: 30, isSeparator: true },
      {
        id: "toolBtnCopy",
        tooltip: "Kopieren / Verschieben",
        matSvgVariable: "Kopieren-Ausschneiden",
        eventId: "COPY",
        pos: 40,
        active: false,
        menu: [
          { eventId: "COPY", label: "Kopieren" },
          { eventId: "COPYTREE", label: "Kopieren mit Teilbaum" },
          { eventId: "CUT", label: "Verschieben (inkl. Teilbaum)" },
        ],
      },
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

    // add event handler for revert
    const toolbarEventSubscription = [
      this.onEvent("COPY").subscribe(() => this.copy()),
      this.onEvent("CUT").subscribe(() => this.cut()),
      this.onEvent("COPYTREE").subscribe(() => this.copy(true)),
    ];

    // set button state according to selected documents
    const treeQuerySubscription = this.query
      .selectActiveId()
      .subscribe(async (data) => {
        if (data.length === 0) {
          this.toolbarService.setButtonState("toolBtnCopy", false);
        } else {
          if (this.isAdmin) {
            this.toolbarService.setButtonState("toolBtnCopy", true);
          } else {
            const buttonEnabled = this.config.hasPermission(
              this.forAddress ? "can_create_address" : "can_create_dataset"
            );
            this.toolbarService.setButtonState("toolBtnCopy", buttonEnabled);
          }

          // set state of menu items
          this.toolbarService.setMenuItemStateOfButton(
            "toolBtnCopy",
            "COPY",
            true
          );
          this.toolbarService.setMenuItemStateOfButton(
            "toolBtnCopy",
            "CUT",
            this.query.getActive().every((active) => active?.hasWritePermission)
          );

          const parentWithChildrenSelected =
            await this.checkForParentsWithSelectedChildren(data);
          this.toolbarService.setMenuItemStateOfButton(
            "toolBtnCopy",
            "COPYTREE",
            parentWithChildrenSelected
          );
        }
      });

    this.formSubscriptions.push(
      ...toolbarEventSubscription,
      treeQuerySubscription
    );
  }

  private async checkForParentsWithSelectedChildren(
    data: ID[]
  ): Promise<boolean> {
    return new Promise((resolve) => {
      return this.checkForParentsWithSelectedChildrenLoop(data, resolve);
    });
  }

  private checkForParentsWithSelectedChildrenLoop(
    data: ID[],
    resolve,
    tries = 10
  ) {
    const allNodesLoaded = data.every((id) => this.query.getEntity(id));
    if (allNodesLoaded) {
      resolve(data.some((id) => this.query.getEntity(id)._hasChildren));
    } else {
      if (tries === 0) {
        console.warn("Node information could not be received from store");
        resolve(false);
      } else {
        console.log(
          "Tree does not have node information yet. Waiting 200ms ..."
        );
        setTimeout(
          () =>
            this.checkForParentsWithSelectedChildrenLoop(
              data,
              resolve,
              --tries
            ),
          200
        );
      }
    }
  }

  async copy(includeTree = false) {
    let handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.forAddress
    );

    if (!handled) {
      return;
    }

    // remove last remembered copied documents
    this.showDialog("Kopieren")
      .pipe(
        switchMap((result) =>
          this.documentService.copy(
            // when copying a tree we don't need the children to be copied
            includeTree
              ? this.getSelectedDatasetsWithoutChildren()
              : this.getSelectedDatasets(),
            result.selection,
            includeTree,
            this.forAddress
          )
        ),
        delay(100), // give some time to be available in store to update tree
        tap((documents) => this.selectCopiedDataset(documents))
      )
      .subscribe();
  }

  private selectCopiedDataset(documents: IgeDocument[]) {
    if (documents.length == 1) {
      const target = this.forAddress ? "address" : "form";
      this.router.navigate([
        `${ConfigService.catalogId}/${target}`,
        { id: documents[0]._uuid },
      ]);
    }
  }

  async cut() {
    let handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.forAddress
    );

    if (!handled) {
      return;
    }
    // remove last remembered copied documents
    this.showDialog("Verschieben")
      .pipe(
        switchMap((result) =>
          this.documentService.move(
            this.getSelectedDatasetsWithoutChildren(),
            result.selection,
            this.forAddress
          )
        )
      )
      .subscribe();
  }

  showDialog(title: string): Observable<any> {
    return this.dialog
      .open(PasteDialogComponent, {
        minWidth: "400px",
        maxWidth: "600px",
        hasBackdrop: true,
        data: {
          titleText: title,
          buttonText: "Einfügen",
          forAddress: this.forAddress,
          typeToInsert: this.getSelectedDatasetDocType(),
        } as PasteDialogOptions,
        delayFocusTrap: true,
      })
      .afterClosed()
      .pipe(
        tap(() => this.eventEl?.focus()),
        filter((result) => result) // only confirmed dialog
      );
  }

  private getSelectedDatasets() {
    return this.query.getActiveId().map((id) => <number>id);
  }

  private getSelectedDatasetsWithoutChildren(): number[] {
    const selection = this.getSelectedDatasets();

    const filtered = selection.filter(
      (id) => !this.isChildOfSelectedParent(id, selection)
    );
    console.log("Filtered datasets without children", filtered);
    return filtered;
  }

  private getSelectedDatasetDocType() {
    return this.query
      .getActive()
      .map((doc) => doc._type)
      .pop();
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      // remove from same index since buttons take the neighbor place after deletion
      this.toolbarService.removeButton("toolBtnCopy");
      this.toolbarService.removeButton("toolBtnCopyCutSeparator");
    }
  }

  private isChildOfSelectedParent(id: number, selection: number[]): boolean {
    const parents = this.query.getParents(id);
    return parents.some(
      (parent) => selection.indexOf(<number>parent.id) !== -1
    );
  }
}
