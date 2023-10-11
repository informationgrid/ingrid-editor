import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { LogoutService } from "../services/logout.service";

@Component({
  selector: "ige-logout-container",
  templateUrl: "./logout-container.component.html",
  styleUrls: ["./logout-container.component.scss"],
})
export class LogoutContainerComponent implements OnInit {
  showLogoutContainer = false;

  constructor(private logoutService: LogoutService) {}

  ngOnInit() {
    this.logoutService.getShowLogoutContainer().subscribe((show) => {
      debugger;
      this.showLogoutContainer = show;
    });
  }
}
