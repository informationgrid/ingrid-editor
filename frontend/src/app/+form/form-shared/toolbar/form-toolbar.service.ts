/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Injectable, signal, untracked } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { IgeError } from "../../../models/ige-error";
import { DocumentAbstract } from "../../../store/document/document.model";

export type ToolbarItemType = "button" | "separator";

export interface DefaultToolbarItem {
  type: ToolbarItemType;
  id: string;
  pos: number;
  align?: "right" | "left";
}

export interface ToolbarMenuItem {
  eventId: string;
  label: string;
  active?: boolean;
  data?: any;
}

export interface ToolbarItem extends DefaultToolbarItem {
  type: "button";
  tooltip?: string;
  matIconVariable?: string;
  matSvgVariable?: string;
  cssClasses?: string;
  eventId: string;
  active?: boolean;
  label?: string;
  isPrimary?: boolean;
  menu?: ToolbarMenuItem[];
  hiddenMenu?: ToolbarMenuItem[];
  hidden?: boolean;
}

export interface Separator extends DefaultToolbarItem {
  type: "separator";
}

@Injectable({
  providedIn: "root",
})
export class FormToolbarService {
  // event when a new button was added
  toolbar$ = signal<Array<ToolbarItem | Separator>>([]);

  private toolbarStateFns: Record<
    string,
    (docs: DocumentAbstract[]) => boolean
  > = {};

  constructor(private docEvents: DocEventsService) {}

  addButton(button: ToolbarItem | Separator) {
    this.checkButtonExists(button);

    const buttons = this.toolbar$();

    buttons.splice(buttons.length, 0, button);

    // sort buttons
    buttons.sort((a, b) => (a.pos < b.pos ? -1 : a.pos === b.pos ? 0 : 1));

    this.toolbar$.set([...buttons]);
  }

  private checkButtonExists(button: ToolbarItem | Separator) {
    const alreadyExists = this.toolbar$().find((but) => but.id === button.id);
    if (alreadyExists)
      throw new IgeError(
        "Toolbar-Button mit gleicher ID existiert bereits: " +
          JSON.stringify(button) +
          " <=> " +
          JSON.stringify(alreadyExists),
      );
  }

  removeButton(id: string): void {
    untracked(() => {
      let index = null;
      this.toolbar$().some((b, i) => {
        if (b.id === id) {
          index = i;
          return true;
        }
      });

      if (index !== null) {
        // mutates signal!
        this.toolbar$().splice(index, 1);
      }
    });
  }

  sendEvent(id: string, data?: any) {
    this.docEvents.sendEvent({ type: id, data: data });
  }

  // trigger click event to open item menu
  openItemMenu(className: string) {
    const button: any = document.getElementsByClassName(className)?.item(0);
    if (button) button.click();
  }

  /**
   * Set the state of a toolbar button to "enabled" or "disabled".
   * @param id
   * @param active
   */
  setButtonState(id: string, active: boolean) {
    // Use untracked to prevent cycles because of plugins, calling this function
    // in an effect. Since we access the toolbar$-signal and modify it we would
    // create an infinite loop.
    untracked(() => {
      const items = this.toolbar$();
      let changed = false;

      for (const item of items) {
        if (item.id === id && item.type === "button") {
          if (item.active !== active) {
            item.active = active; // in-place mutation
            changed = true;
          }
          break;
        }
      }

      if (changed) {
        // emit only when there was a real change
        this.toolbar$.set([...items]);
      }
    });
  }

  setMenuItemStateOfButton(id: string, eventId: string, active: boolean) {
    untracked(() => {
      const button = <ToolbarItem>this.getButtonById(id);
      if (button) {
        const menuButton = button.menu.find((item) => item.eventId === eventId);

        if (menuButton) {
          const items = this.toolbar$();
          menuButton.active = active;
          this.toolbar$.set([...items]);
        }
      }
    });
  }

  getButtonById(id: string): DefaultToolbarItem {
    return this.toolbar$().find((b) => b.id === id);
  }

  updateHiddenButton(id: string, hide: boolean) {
    untracked(() => {
      const button = this.getButtonById("toolBtnPublish") as ToolbarItem;
      if (button) {
        const items = this.toolbar$();
        button.hidden = hide;
        this.toolbar$.set([...items]);
      } else
        console.error("Button not found for toggling hidden property: " + id);
    });
  }

  updateHiddenMenu(id: string, hiddenMenu: Array<ToolbarMenuItem>) {
    const button = <ToolbarItem>this.getButtonById(id);
    if (button) {
      button.hiddenMenu = hiddenMenu;
    }
  }

  setToolbarButtonEnabledFn(
    btnId: string,
    fn: (docs: DocumentAbstract[]) => boolean,
  ) {
    this.toolbarStateFns[btnId] = fn;
  }

  isToolbarButtonEnabled(btnId: string, docs: DocumentAbstract[]) {
    const fn = this.toolbarStateFns[btnId];
    return !fn ? true : fn(docs);
  }
}
