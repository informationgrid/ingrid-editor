import { Component, Input, OnInit } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { FrontendGroup } from "../../../models/user-group";

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
})
export class GroupHeaderMoreComponent implements OnInit {
  @Input() group: FrontendGroup;
  @Input() showMore = false;

  constructor() {}

  ngOnInit() {}
}
