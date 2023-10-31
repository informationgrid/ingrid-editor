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
