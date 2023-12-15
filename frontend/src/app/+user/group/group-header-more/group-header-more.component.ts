/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, Input, OnInit } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { Group } from "../../../models/user-group";

@Component({
  selector: "group-header-more",
  templateUrl: "./group-header-more.component.html",
  styleUrls: ["./group-header-more.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("250ms ease-out", style({ height: 60, opacity: 1 })),
      ]),
      transition(":leave", [
        style({ height: 60, opacity: 1 }),
        animate("250ms linear", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class GroupHeaderMoreComponent implements OnInit {
  @Input() group: Group;
  @Input() showMore = false;

  constructor() {}

  ngOnInit() {}
}
