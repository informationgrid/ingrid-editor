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
import { effect, inject, Injectable } from "@angular/core";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { DocumentAbstract } from "../../../store/document/document.model";
import { TreeStore } from "../../../store/tree/tree.store";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { Router } from "@angular/router";
import { UpdateType } from "../../../models/update-type.enum";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { FormUtils } from "../../form.utils";
import { DocumentService } from "../../../services/document/document.service";
import { FormStateService } from "../../form-state.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../../../services/config/config.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";
import { MatMenuTrigger } from "@angular/material/menu";
import { GeneralStore } from "../../../store/general.store";

@Injectable()
export class HistoryPlugin extends Plugin {
  id = "plugin.history";
  name = "History Plugin";
  description =
    "Fügt Buttons hinzu, um zum vorherigen und nächsten Datensatz zu springen.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  private generalStore = inject(GeneralStore);

  private stack: DocumentAbstract[] = [];

  // maximum of nodes in stack
  maxSize = 20;

  // a pointer to show were we are in the history stack
  pointer = -1;

  // when loading a node by back-Button, we don't want to add it to the stack!
  ignoreNextPush = false;

  private navigatePath: string;

  constructor(
    private router: Router,
    private formToolbarService: FormToolbarService,
    private docTreeStore: TreeStore,
    private docTreeQuery: TreeQuery,
    private docEvents: DocEventsService,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
    effect(() => {
      const doc = this.generalStore.openedDocument();
      if (doc !== null) {
        this.addDocToStack(doc);
      }
    });
    effect(() => {
      const info = this.generalStore.datasetsChanged();
      if (info?.type === UpdateType.Delete) {
        this.removeDeletedDocsFromStack(info.data);
      }
    });
  }

  registerForm() {
    this.setupFields();

    super.registerForm();

    this.addToolbarButtons();

    this.handleEvents();
  }

  private setupFields() {
    if (this.forAddress) {
      this.navigatePath = "/address";
    } else {
      this.navigatePath = "/form";
    }
  }

  private addDocToStack(doc: DocumentAbstract) {
    if (this.ignoreNextPush) {
      this.ignoreNextPush = false;
      return;
    }

    // if the last node was loaded again -> ignore
    if (
      this.stack.length !== 0 &&
      doc.id === this.stack[this.stack.length - 1].id
    ) {
      return;
    }

    // remove everything after the pointer to discard nodes from history, when we came back
    this.stack.splice(this.pointer + 1);

    this.stack.push(doc);

    // if stack gets too big, then remove first item
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.pointer++;
    }

    this.handleButtonState();
  }

  private eventIdNext = "HISTORY_NEXT";
  private eventIdPrevious = "HISTORY_PREVIOUS";

  private handleEvents() {
    this.formSubscriptions.push(
      // react on event when button is clicked
      this.docEvents
        .onEvent(this.eventIdNext)
        .subscribe(() => this.handleNext()),
      this.docEvents
        .onEvent(this.eventIdPrevious)
        .subscribe(() => this.handlePrevious()),
      this.docEvents
        .onEvent(`${this.eventIdPrevious}_LONGPRESS`)
        .subscribe((event) => {
          this.handleListPrevious(event.data);
        }),
      this.docEvents
        .onEvent(`${this.eventIdNext}_LONGPRESS`)
        .subscribe((event) => {
          this.handleListNext(event.data);
        }),
      this.docEvents.onEvent("HISTORY_PREVIOUS_SELECT").subscribe((item) => {
        this.handleHistorySelect(item, "PREVIOUS");
      }),
      this.docEvents.onEvent("HISTORY_NEXT_SELECT").subscribe((item) => {
        this.handleHistorySelect(item, "NEXT");
      }),
    );
  }

  private addToolbarButtons() {
    const buttons: Array<ToolbarItem | Separator> = [
      { id: "toolBtnNewSeparator", pos: 190, isSeparator: true },
      {
        id: "toolBtnPreviousInHistory",
        tooltip: "Springe zum letzten Dokument",
        matSvgVariable: "Vorheriger-Datensatz",
        eventId: this.eventIdPrevious,
        pos: 200,
        active: false,
        hiddenMenu: [],
      },
      {
        id: "toolBtnNextInHistory",
        tooltip: "Springe zum nächsten Dokument",
        matSvgVariable: "Naechster-Datensatz",
        eventId: this.eventIdNext,
        pos: 210,
        active: false,
        hiddenMenu: [],
      },
    ];
    buttons.forEach((button) => this.formToolbarService.addButton(button));
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnNewSeparator");
      this.formToolbarService.removeButton("toolBtnPreviousInHistory");
      this.formToolbarService.removeButton("toolBtnNextInHistory");

      this.stack = [];
      this.pointer = -1;
    }
  }

  private async handleNext() {
    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }
    this.ignoreNextPush = true;
    const dirtyFormHandled = await this.handleDirtyForm();
    if (!dirtyFormHandled) {
      this.ignoreNextPush = false;
      return;
    }

    const node = this.stack[this.pointer + 1];
    if (this.hasNext()) {
      this.pointer++;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private async handlePrevious() {
    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }
    this.ignoreNextPush = true;
    const dirtyFormHandled = await this.handleDirtyForm();
    if (!dirtyFormHandled) {
      this.ignoreNextPush = false;
      return;
    }

    // if current node is not last from stack we go to end of stack
    const currentOpenedDocumentId = this.getOpenedDocument()?.id;
    if (currentOpenedDocumentId !== this.stack[this.pointer].id) {
      return this.gotoNode(this.stack[this.pointer]);
    }

    const node = this.stack[this.pointer - 1];
    if (this.pointer > 0) {
      this.pointer--;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private hasNext() {
    return this.pointer < this.stack.length - 1;
  }

  private hasPrevious() {
    return this.pointer > 0;
  }

  private async gotoNode(item: DocumentAbstract) {
    const navigated = await this.router.navigate([
      ConfigService.catalogId + this.navigatePath,
      { id: item._uuid },
    ]);
    if (navigated) {
      this.ignoreNextPush = true;
      this.generalStore.setExplicitActiveNode(
        new ShortTreeNode(<number>item.id, item.title),
      );
    }
    return navigated;
  }

  private handleButtonState() {
    this.formToolbarService.setButtonState(
      "toolBtnPreviousInHistory",
      this.hasPrevious(),
    );
    this.formToolbarService.setButtonState(
      "toolBtnNextInHistory",
      this.hasNext(),
    );
  }

  private removeDeletedDocsFromStack(docs: DocumentAbstract[]) {
    docs.forEach((doc) => {
      const stackItemIndex = this.stack.findIndex((item) => item.id === doc.id);
      if (stackItemIndex !== -1) {
        this.stack.splice(stackItemIndex, 1);
        if (this.stack.length === this.pointer) this.pointer--;
      }
    });
    this.handleButtonState();
  }

  /**
   * Initializes and opens a mat-menu with clickable list of next nodes in history
   * @param trigger
   * @private
   */
  private handleListNext(trigger?: MatMenuTrigger) {
    const history = this.stack.slice(this.pointer + 1).map((item) => {
      return {
        eventId: "HISTORY_NEXT_SELECT",
        label: item.title,
        data: item,
      };
    });

    this.formToolbarService.updateHiddenMenu("toolBtnNextInHistory", history);
    trigger.openMenu();
  }

  /**
   * Initializes and opens a mat-menu with clickable list of previously visited nodes upon long press
   * @param trigger
   * @private
   */
  private handleListPrevious(trigger?: MatMenuTrigger) {
    const history = this.stack
      .slice(0, this.pointer)
      .reverse()
      .map((item) => {
        return {
          eventId: "HISTORY_PREVIOUS_SELECT",
          label: item.title,
          data: item,
        };
      });

    this.formToolbarService.updateHiddenMenu(
      "toolBtnPreviousInHistory",
      history,
    );
    trigger.openMenu();
  }

  /**
   * Handles the selection of a node from previous history list
   */
  private async handleHistorySelect(item: any, direction: "PREVIOUS" | "NEXT") {
    const isCurrentDocument =
      this.getOpenedDocument()?.id === item.data.data.id;
    if (isCurrentDocument) return;

    const dirtyFormHandled = await this.handleDirtyForm();
    if (!dirtyFormHandled) return;

    if (direction === "PREVIOUS")
      this.pointer = this.pointer - item.data.index - 1;
    else this.pointer = this.pointer + item.data.index + 1;

    this.gotoNode(item.data.data);
    this.handleButtonState();
    return;
  }

  private getOpenedDocument(): DocumentAbstract {
    return this.forAddress
      ? this.generalStore.openedAddress()
      : this.generalStore.openedDocument();
  }

  private handleDirtyForm() {
    return FormUtils.handleDirtyForm(
      this.formStateService,
      this.documentService,
      this.dialog,
      this.forAddress,
    );
  }
}
