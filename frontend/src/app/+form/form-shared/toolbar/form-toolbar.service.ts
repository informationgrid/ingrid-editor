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
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { IgeError } from "../../../models/ige-error";

export interface DefaultToolbarItem {
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
  showHiddenMenu?: boolean;
}

export interface Separator extends DefaultToolbarItem {
  isSeparator: boolean;
}

@Injectable({
  providedIn: "root",
})
export class FormToolbarService {
  // event when a new button was added
  toolbar$ = new BehaviorSubject<Array<ToolbarItem | Separator>>([]);

  // events coming from a toolbar button
  // toolbarEvent$ = new Subject<string>();

  private _buttons: Array<ToolbarItem | Separator> = [];

  constructor(private docEvents: DocEventsService) {}

  get buttons(): Array<ToolbarItem | Separator> {
    return this._buttons;
  }

  addButton(button: ToolbarItem | Separator) {
    this.checkButtonExists(button);

    const pos = this._buttons.length;

    this._buttons.splice(pos, 0, button);

    // sort buttons
    this._buttons.sort((a, b) =>
      a.pos < b.pos ? -1 : a.pos === b.pos ? 0 : 1,
    );

    this.toolbar$.next(this.buttons);
  }

  private checkButtonExists(button: ToolbarItem | Separator) {
    const alreadyExists = this._buttons.find((but) => but.id === button.id);
    if (alreadyExists)
      throw new IgeError(
        "Toolbar-Button mit gleicher ID existiert bereits: " +
          JSON.stringify(button) +
          " <=> " +
          JSON.stringify(alreadyExists),
      );
  }

  removeButton(id: string): void {
    let index = null;
    this._buttons.some((b, i) => {
      if (b.id === id) {
        index = i;
        return true;
      }
    });

    if (index !== null) {
      this._buttons.splice(index, 1);
    }

    this.toolbar$.next(this.buttons);
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
   * Set the state of a toolbar button to enabled or disabled.
   * @param id
   * @param active
   */
  setButtonState(id: string, active: boolean) {
    const button = <ToolbarItem>this.getButtonById(id);
    if (button) {
      button.active = active;
    }
  }

  setMenuItemStateOfButton(id: string, eventId: string, active: boolean) {
    const button = <ToolbarItem>this.getButtonById(id);
    if (button) {
      const menuButton = button.menu.find((item) => item.eventId === eventId);

      if (menuButton) {
        menuButton.active = active;
      }
    }
  }

  getButtonById(id: string): DefaultToolbarItem {
    return this._buttons.find((b) => b.id === id);
  }
  updateHiddenMenu(id: string, hiddenMenu: Array<ToolbarMenuItem>) {
    const button = <ToolbarItem>this.getButtonById(id);
    if (button) {
      button.hiddenMenu = hiddenMenu;
    }
  }

  activateHiddenMenu(id: string) {
    const button = <ToolbarItem>this.getButtonById(id);
    if (button) {
      button.showHiddenMenu = true;
    }
  }
}
