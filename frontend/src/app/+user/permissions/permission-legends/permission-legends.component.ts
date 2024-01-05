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
import { Component, Input, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { NgForOf, NgIf } from "@angular/common";

interface Legend {
  icon?: String;
  svgIcon?: String;
  text: String;
}

@Component({
  selector: "permission-legends",
  templateUrl: "./permission-legends.component.html",
  styleUrls: ["./permission-legends.component.scss"],
  imports: [MatIconModule, NgIf, NgForOf],
  standalone: true,
})
export class PermissionLegendsComponent implements OnInit {
  @Input() showReadLegend = true;
  @Input() showWriteLegend = true;
  @Input() showSubdirectoryLegend = true;

  legends: Legend[] = [];

  ngOnInit() {
    if (this.showReadLegend) this.legends.push(this.readLegend);
    if (this.showSubdirectoryLegend) this.legends.push(this.subdirectoryLegend);
    if (this.showWriteLegend) this.legends.push(this.writeLegend);
  }

  get readLegend(): Legend {
    return {
      icon: "visibility",
      text: "Leserecht",
    };
  }

  get writeLegend(): Legend {
    return {
      icon: "edit",
      text: "Schreibrecht",
    };
  }

  get subdirectoryLegend(): Legend {
    return {
      svgIcon: "edit-lock-folder",
      text: "Nur Unterordner",
    };
  }
}
