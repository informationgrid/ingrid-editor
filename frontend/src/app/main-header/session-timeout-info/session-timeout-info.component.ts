import { Component, Input, OnInit } from "@angular/core";
import { AuthenticationFactory } from "../../security/auth.factory";

@Component({
  selector: "ige-session-timeout-info",
  templateUrl: "./session-timeout-info.component.html",
  styleUrls: ["./session-timeout-info.component.scss"],
})
export class SessionTimeoutInfoComponent implements OnInit {
  @Input() timeout: number;
  @Input() autoHide: boolean = true;

  constructor(private authFactory: AuthenticationFactory) {}

  ngOnInit(): void {}

  refreshSession() {
    this.authFactory.get().refreshToken();
  }
}
