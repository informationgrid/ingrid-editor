import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import {
  FormToolbarService,
  ToolbarItem,
} from "../../../../+form/form-shared/toolbar/form-toolbar.service";
import { FormPluginsService } from "../../../../+form/form-shared/form-plugins.service";

@Injectable({
  providedIn: "root",
})
export class TreeModeToolbarBehaviour extends Plugin {
  id = "plugin.tree.mode.toolbar";
  name = "Toolbar Zustände wenn Mehrfachauswahl im Baum";
  description =
    "Abhängig vom Auswahlmodus im Baum werden die Toolbar-Buttons aktiviert bzw. deaktiviert";
  defaultActive = true;

  private activeToolbarItemsInMultiSelect = ["toolBtnCopy", "toolBtnRemove"];
  private previousState: { id: string; active: boolean }[];
  private query: TreeQuery | AddressTreeQuery;

  constructor(
    private treeQuery: TreeQuery,
    private toolbarService: FormToolbarService,
    private addressTreeQuery: AddressTreeQuery
  ) {
    super();
    inject(FormPluginsService).registerPlugin(this);
  }

  register() {
    super.register();

    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    this.query.multiSelectMode$.subscribe((multiSelectMode) =>
      this.handleMode(multiSelectMode)
    );
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
        this.previousState.find((prev) => prev.id === button.id)?.active
      )
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
          !this.activeToolbarItemsInMultiSelect.find((id) => button.id === id)
      )
      .forEach((button) =>
        this.toolbarService.setButtonState(button.id, false)
      );
  }
}
