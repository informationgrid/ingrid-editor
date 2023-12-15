/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { TreeQuery } from "../../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import {
  FormToolbarService,
  ToolbarItem,
} from "../../../../+form/form-shared/toolbar/form-toolbar.service";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class TreeModeToolbarBehaviour extends Plugin {
  id = "plugin.tree.mode.toolbar";
  name = "Toolbar Zustände wenn Mehrfachauswahl im Baum";
  description =
    "Abhängig vom Auswahlmodus im Baum werden die Toolbar-Buttons aktiviert bzw. deaktiviert";
  defaultActive = true;
  hide = true;

  private activeToolbarItemsInMultiSelect = ["toolBtnCopy", "toolBtnRemove"];
  private previousState: { id: string; active: boolean }[];
  private query: TreeQuery | AddressTreeQuery;

  constructor(
    private treeQuery: TreeQuery,
    private toolbarService: FormToolbarService,
    private addressTreeQuery: AddressTreeQuery,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    const subscription = this.query.multiSelectMode$.subscribe(
      (multiSelectMode) => this.handleMode(multiSelectMode),
    );

    this.formSubscriptions.push(subscription);
  }

  private handleMode(multiSelectMode: boolean) {
    if (multiSelectMode) {
      this.handleMultiSelectMode();
    } else {
      this.handleSingleSelectionMode();
    }
  }

  private handleSingleSelectionMode() {
    if (!this.previousState) {
      return;
    }

    this.toolbarService.buttons.forEach((button) =>
      this.toolbarService.setButtonState(
        button.id,
        this.previousState.find((prev) => prev.id === button.id)?.active,
      ),
    );
  }

  private handleMultiSelectMode() {
    this.previousState = this.toolbarService.buttons.map((button) => ({
      id: button.id,
      active: (<ToolbarItem>button).active,
    }));

    this.toolbarService.buttons
      .filter(
        (button) =>
          !this.activeToolbarItemsInMultiSelect.find((id) => button.id === id),
      )
      .forEach((button) =>
        this.toolbarService.setButtonState(button.id, false),
      );
  }
}
