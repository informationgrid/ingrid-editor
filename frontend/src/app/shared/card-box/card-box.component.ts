/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import {
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { MatCard, MatCardContent, MatCardTitle } from "@angular/material/card";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatDivider } from "@angular/material/divider";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-card-box",
  templateUrl: "./card-box.component.html",
  styleUrls: ["./card-box.component.scss"],
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatSlideToggle,
    MatCardContent,
    MatDivider,
    MatButton,
  ],
})
export class CardBoxComponent implements OnInit {
  @Input() label: string;
  nameOfToggle = input<string>(null);

  // button besides label, if provided
  @Input() endBtnTitle: string;
  @Output() endBtnOnClick = new EventEmitter<void>();
  @Output() toggle = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}
}
