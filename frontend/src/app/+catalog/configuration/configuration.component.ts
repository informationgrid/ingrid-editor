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
import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { fields } from "./formly-fields";
import { CodelistService } from "../../services/codelist/codelist.service";
import { CatalogService } from "../services/catalog.service";

@Component({
  selector: "ige-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.scss"],
})
export class ConfigurationComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields = fields(this.codelistService);
  model: any = {};

  constructor(
    private codelistService: CodelistService,
    private catalogService: CatalogService,
  ) {}

  ngOnInit(): void {
    this.catalogService.getConfig().subscribe((value) => (this.model = value));
  }

  save() {
    this.catalogService.saveConfig(this.form.value);
  }
}
