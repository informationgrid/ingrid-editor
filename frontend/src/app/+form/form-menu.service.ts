import { Injectable } from "@angular/core";
import { ConfigService } from "../services/config/config.service";

export interface FormularMenuItem {
  name: string;
  title: string;
  action?: () => void;
  link?: string;
  disabled?: boolean;
}

export type MenuId = "address" | "dataset" | "user" | "group" | "settings";

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
          console.log("Calling help");
        },
      },
      this.configService.getConfiguration().showAccessibilityLink
        ? {
            title: "Barrierefreiheit",
            name: "accessibility",
            link:
              this.configService.getConfiguration().contextPath +
              "barrierefreiheit",
            action: () => {
              console.log("Calling Accessibility");
            },
          }
        : null,
    ].filter(Boolean) as FormularMenuItem[],
  };

  constructor(private configService: ConfigService) {}

  getMenuItems(menuId: MenuId): FormularMenuItem[] {
    return this.menuItems[menuId];
  }

  addMenuItem(menuId: MenuId, menuItem: FormularMenuItem): void {
    this.menuItems[menuId].push(menuItem);
  }

  removeMenuItem(menuId: MenuId, menuItemName: string): void {
    this.menuItems[menuId] = this.menuItems[menuId].filter(
      (item) => item.name !== menuItemName
    );
  }
}
