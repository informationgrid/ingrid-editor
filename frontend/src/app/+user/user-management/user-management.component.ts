import { Component, OnInit, ViewChild } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";

@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit {
  currentTab = 0;

  @ViewChild("user") user: UserComponent;
  @ViewChild("group") group: GroupComponent;

  constructor() {}

  ngOnInit(): void {}
}
