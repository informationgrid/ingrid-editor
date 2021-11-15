import { AfterViewInit, Component, HostListener } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { UntilDestroy } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent {
  currentComponent: UserComponent | GroupComponent;

  activeLink = "user";

  tabs = [
    { label: "Nutzer", path: "user" },
    { label: "Gruppen & Rechte", path: "group" },
  ];

  constructor() {}

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler() {
    return !this.currentComponent?.form?.dirty;
  }

  onActivate(componentRef) {
    this.currentComponent = componentRef;
  }
}
