import { Component, Input, OnInit } from "@angular/core";
import { AuthService } from "../../services/security/auth.service";

@Component({
  selector: "ige-session-timeout-info",
  templateUrl: "./session-timeout-info.component.html",
  styleUrls: ["./session-timeout-info.component.scss"],
})
export class SessionTimeoutInfoComponent implements OnInit {
  @Input() timeout: number;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

  refreshSession() {
    this.auth.refreshSession().subscribe();
  }
}
