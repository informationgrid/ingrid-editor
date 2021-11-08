import {
  AfterViewInit,
  Component,
  HostListener,
  ViewChild,
} from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { SessionService } from "../../services/session.service";
import { MatTabGroup } from "@angular/material/tabs";
import { UserService } from "../../services/user/user.service";
import { User } from "../user";

@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements AfterViewInit {
  @ViewChild("user") user: UserComponent;
  @ViewChild("group") group: GroupComponent;
  @ViewChild(MatTabGroup) tabs: MatTabGroup;

  selectedIndex = this.sessionService.observeTabChange("user");

  constructor(
    private sessionService: SessionService,
    private userService: UserService
  ) {}

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    return !(this.user?.form?.dirty || this.group?.form?.dirty);
  }

  ngAfterViewInit(): void {
    if (!this.tabs) {
      throw Error("ViewChild(MatTabGroup) tabs; is not defined.");
    }

    const handleTabClick = this.tabs._handleClick;

    this.tabs._handleClick = (tab, header, index) => {
      if (index !== this.tabs.selectedIndex) {
        const component = this.user ?? this.group;
        component.dirtyFormHandled().subscribe((allClear) => {
          if (allClear) handleTabClick.apply(this.tabs, [tab, header, index]);
        });
      }
    };
  }

  handleTabChange(tabIndex: number) {
    this.sessionService.updateCurrentTab("user", tabIndex);
  }

  switchToUser(user: User) {
    if (0 !== this.tabs.selectedIndex) this.handleTabChange(0);
    this.userService.selectedUser$.next(user);
  }
}
