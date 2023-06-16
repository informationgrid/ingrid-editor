import { Injectable } from "@angular/core";

export interface FormularMenuItem {
  name: string;
  title: string;
  action: () => void;
  disabled?: boolean;
}

export type MenuId = "address" | "dataset" | "user" | "group";

@Injectable({
  providedIn: "root",
})
export class FormMenuService {
  private menuItems = {
    address: [] as FormularMenuItem[],
    dataset: [] as FormularMenuItem[],
    user: [] as FormularMenuItem[],
    group: [] as FormularMenuItem[],
  };

  constructor() {}

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
