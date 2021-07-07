import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { MatTabGroup } from "@angular/material/tabs";

@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements AfterViewInit {
  currentTab = 0;

  @ViewChild("user") user: UserComponent;
  @ViewChild("group") group: GroupComponent;
  @ViewChild(MatTabGroup) tabs: MatTabGroup;

  constructor() {}

  ngAfterViewInit(): void {
    if (!this.tabs) {
      throw Error("ViewChild(MatTabGroup) tabs; is not defined.");
    }

    const handleTabClick = this.tabs._handleClick;

    this.tabs._handleClick = (tab, header, index) => {
      if (index !== this.currentTab) {
        const component = this.currentTab === 0 ? this.user : this.group;
        component.dirtyFormHandled().subscribe((allClear) => {
          if (allClear) handleTabClick.apply(this.tabs, [tab, header, index]);
        });
      }
    };
  }
}
