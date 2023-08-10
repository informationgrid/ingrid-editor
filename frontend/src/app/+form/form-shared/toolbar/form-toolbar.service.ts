import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  DocEvent,
  DocEventsService,
} from "../../../services/event/doc-events.service";

export interface DefaultToolbarItem {
  id: string;
  pos: number;
  align?: "right" | "left";
}

export interface ToolbarMenuItem {
  eventId: string;
  label: string;
  active?: boolean;
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
    const pos = this._buttons.length;

    this._buttons.splice(pos, 0, button);

    // sort buttons
    this._buttons.sort((a, b) =>
      a.pos < b.pos ? -1 : a.pos === b.pos ? 0 : 1
    );

    this.toolbar$.next(this.buttons);
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

  sendEvent(id: string) {
    this.docEvents.sendEvent({ type: id });
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

  private getButtonById(id: string): DefaultToolbarItem {
    return this._buttons.find((b) => b.id === id);
  }
}
