import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { FrontendUser } from "../../user";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "user-header-more",
  templateUrl: "./header-more.component.html",
  styleUrls: ["./header-more.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms", style({ height: 134, opacity: 1 })),
      ]),
      transition(":leave", [
        style({ height: 134, opacity: 1 }),
        animate("300ms", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMoreComponent implements OnInit {
  @Input() user: FrontendUser;
  @Input() allUsers: FrontendUser[];
  @Input() form: FormGroup;
  @Input() showMore = false;
  standinUsers: String[];

  constructor() {}

  ngOnInit() {
    this.standinUsers = this.getStandinUsers();
  }

  getStandinUsers(): String[] {
    // TODO implement
    return [];
  }

  getManagerInfo(managerLogin: string): string {
    const manager = this.allUsers.find((u) => u.login == managerLogin);
    if (manager) {
      return (
        `${manager.firstName} ${manager.lastName}` +
        (manager.organisation ? ` (${manager.organisation})` : "")
      );
    } else {
      return managerLogin;
    }
  }
}
