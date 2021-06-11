import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { animate, style, transition, trigger } from "@angular/animations";
import { DocumentUtils } from "../../../services/document.utils";
import { ProfileQuery } from "../../../store/profile/profile.query";
import { FrontendUser } from "../../user";
import { FormGroup } from "@angular/forms";
import { Group } from "../../../models/user-group";

@Component({
  selector: "group-header-more",
  templateUrl: "./group-header-more.component.html",
  styleUrls: ["./group-header-more.component.scss"],
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
export class GroupHeaderMoreComponent implements OnInit {
  @Input() group: Group;
  @Input() showMore = false;

  constructor(private profileQuery: ProfileQuery) {}

  ngOnInit() {}
}
