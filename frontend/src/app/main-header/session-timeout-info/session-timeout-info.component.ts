import { Component, Input, OnInit } from "@angular/core";
import { KeycloakService } from "keycloak-angular";

@Component({
  selector: "ige-session-timeout-info",
  templateUrl: "./session-timeout-info.component.html",
  styleUrls: ["./session-timeout-info.component.scss"],
})
export class SessionTimeoutInfoComponent implements OnInit {
  @Input() timeout: number;

  constructor(private auth: KeycloakService) {}

  ngOnInit(): void {}

  refreshSession() {
    this.auth.updateToken(60);
  }
}
