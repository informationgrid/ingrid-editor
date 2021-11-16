import { AfterViewInit, Component, HostListener, OnInit } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { SessionService } from "../../services/session.service";
import { filter } from "rxjs/operators";

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

  constructor(private router: Router, private sessionService: SessionService) {}

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler() {
    return !this.currentComponent?.form?.dirty;
  }

  onActivate(componentRef) {
    this.currentComponent = componentRef;
  }

  ngOnInit(): void {
    this.sessionService
      .observeTabChange("manage")
      .pipe(untilDestroyed(this))
      .subscribe((index) => {
        this.router.navigate(["/manage/" + this.tabs[index].path]);
      });
  }

  updateTab(index: number) {
    this.sessionService.updateCurrentTab("manage", index);
  }
}
