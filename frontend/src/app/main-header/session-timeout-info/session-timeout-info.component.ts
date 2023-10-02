import { Component, Input, OnInit } from "@angular/core";
import { AuthenticationFactory } from "../../security/auth.factory";
import { A11yModule } from "@angular/cdk/a11y";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { NgIf } from "@angular/common";
import { TimePipe } from "../../directives/time.pipe";

@Component({
  selector: "ige-session-timeout-info",
  templateUrl: "./session-timeout-info.component.html",
  styleUrls: ["./session-timeout-info.component.scss"],
  standalone: true,
  imports: [
    A11yModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    NgIf,
    TimePipe,
  ],
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
