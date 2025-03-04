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
import { Injectable } from "@angular/core";
import { ConfigService } from "../services/config/config.service";

export interface FormularMenuItem {
  name: string;
  title: string;
  action?: () => void;
  link?: string;
  disabled?: boolean;
}

export type MenuId =
  | "address"
  | "dataset"
  | "user"
  | "group"
  | "settings"
  | "publish";

@Injectable({
  providedIn: "root",
})
export class FormMenuService {
  private menuItems = {
    address: [] as FormularMenuItem[],
    dataset: [] as FormularMenuItem[],
    user: [] as FormularMenuItem[],
    group: [] as FormularMenuItem[],
    settings: [
      {
        title: "Hilfe",
        name: "help",
        link: this.configService.$userInfo.getValue().externalHelp,
        action: () => {
          console.debug("Calling help");
        },
      },
    ].filter(Boolean) as FormularMenuItem[],
  };

  private excludedMenuItems: Partial<Record<MenuId, string[]>> = {};

  constructor(private configService: ConfigService) {}

  getMenuItems(menuId: MenuId): FormularMenuItem[] {
    return this.menuItems[menuId];
  }

  addMenuItem(menuId: MenuId, menuItem: FormularMenuItem): void {
    this.menuItems[menuId].push(menuItem);
  }

  removeMenuItem(menuId: MenuId, menuItemName: string): void {
    this.menuItems[menuId] = this.menuItems[menuId].filter(
      (item) => item.name !== menuItemName,
    );
  }

  getExcludedMenuItems(menuId: MenuId): string[] {
    return this.excludedMenuItems[menuId] || [];
  }

  addExcludedMenuItems(menuId: MenuId, items: string[]) {
    if (!this.excludedMenuItems[menuId]) {
      this.excludedMenuItems[menuId] = [];
    }
    this.excludedMenuItems[menuId].push(...items);
  }
}
