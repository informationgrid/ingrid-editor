import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class LogoutService {
  constructor() {}

  private showLogoutContainer = new BehaviorSubject<boolean>(false);

  getShowLogoutContainer() {
    return this.showLogoutContainer.asObservable();
  }

  setShowLogoutContainer(value: boolean) {
    debugger;
    debugger;
    this.showLogoutContainer.next(value);
  }
}
