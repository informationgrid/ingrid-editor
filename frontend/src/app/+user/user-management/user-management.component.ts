import { AfterViewInit, Component, HostListener } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { SessionService } from "../../services/session.service";
import { NavigationEnd, Router } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter } from "rxjs/operators";

@UntilDestroy()
@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements AfterViewInit {
  currentComponent: UserComponent | GroupComponent;

  tabs = [
    { label: "Nutzer", path: "user" },
    { label: "Gruppen & Rechte", path: "group" },
  ];

  constructor(private router: Router, private sessionService: SessionService) {
    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // only update tab from route if it was set explicitly in URL
        if (event.url === event.urlAfterRedirects) {
          const activeTabIndex = this.getActiveTabIndex();
          this.sessionService.updateCurrentTab("manage", activeTabIndex);
        }
      }
    });
  }

  getActiveTabIndex(): number {
    const activeLink =
      this.router.getCurrentNavigation()?.finalUrl?.root?.children?.primary
        ?.segments[1]?.path ?? "user";
    return this.tabs.findIndex((tab) => tab.path === activeLink);
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    return !this.currentComponent?.form?.dirty;
  }

  ngAfterViewInit(): void {}

  activeLink = "user";

  ngOnInit(): void {
    this.sessionService
      .observeTabChange("manage")
      .pipe(
        untilDestroyed(this),
        filter((index) => index !== undefined)
      )
      .subscribe((index) => {
        const tab = this.tabs[index];
        this.activeLink = tab.path;
        this.router.navigate(["/manage/" + tab.path]);
      });
  }

  onActivate(componentRef) {
    this.currentComponent = componentRef;
  }
}
