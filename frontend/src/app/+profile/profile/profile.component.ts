import { Component, OnInit } from "@angular/core";
import { ProfileQuery } from "../../store/profile/profile.query";
import { ConfigService } from "../../services/config/config.service";
import { UserService } from "../../services/user/user.service";

@Component({
  selector: "ige-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    public userService: UserService
  ) {}
  userInfo$ = this.configService.$userInfo;

  getRoleLabel(role: string): string {
    return this.userService.availableRoles.find((r) => r.value == role)?.label;
  }

  ngOnInit(): void {}
}
