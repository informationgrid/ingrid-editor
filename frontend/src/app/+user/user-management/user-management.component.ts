import { Component, HostListener, OnInit } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../../services/session.service";
import { GroupService } from "../../services/role/group.service";

@UntilDestroy()
@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements OnInit {
  currentComponent: UserComponent | GroupComponent;

  tabs = [
    { label: "Nutzer", path: "user" },
    { label: "Gruppen & Rechte", path: "group" },
  ];

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private groupService: GroupService,
    activeRoute: ActivatedRoute
  ) {
    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    // example: reload page being on 2nd tab -> goto dashboard -> come back again
    const currentPath = activeRoute.snapshot.firstChild.url[0].path;
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === currentPath
    );
    if (activeTabIndex !== 0) {
      this.updateTab(activeTabIndex);
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler() {
    return !this.currentComponent?.form?.dirty;
  }

  onActivate(componentRef) {
    this.currentComponent = componentRef;
  }

  ngOnInit(): void {
    this.groupService.getGroups();
  }

  updateTab(index: number) {
    this.sessionService.updateCurrentTab("manage", index);
  }
}
