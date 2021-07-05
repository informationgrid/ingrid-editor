import { Injectable } from "@angular/core";
import { SessionStore } from "../store/session.store";

@Injectable()
export class UserManagementService {
  constructor(private sessionStore: SessionStore) {}

  rememberTableWidth(info) {
    this.updateTableWidth(info.sizes[0]);
  }

  updateTableWidth(size: number) {
    this.sessionStore.update((state) => ({
      ui: {
        ...state.ui,
        userTableWidth: size,
      },
    }));
  }
}
