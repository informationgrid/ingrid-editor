import { Component, OnInit, ViewChild } from "@angular/core";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { FormPluginsService } from "../+form/form-shared/form-plugins.service";
import { Router } from "@angular/router";

@Component({
  selector: "ige-catalog-settings",
  templateUrl: "./catalog-settings.component.html",
  styleUrls: ["./catalog-settings.component.scss"],
  providers: [FormPluginsService],
})
export class CatalogSettingsComponent implements OnInit {
  @ViewChild("behaviours") behaviourComponent: BehavioursComponent;

  activeLink = "general";

  tabs = [
    { label: "Codelisten", path: "codelists" },
    { label: "Formulare", path: "form-behaviours", params: { type: "form" } },
    {
      label: "Katalogverhalten",
      path: "catalog-behaviours",
      params: { type: "catalog" },
    },
    { label: "Indizierung", path: "indexing" },
  ];

  constructor(router: Router) {
    this.activeLink =
      router.getCurrentNavigation().extractedUrl.root.children.primary
        .segments[1]?.path ?? "general";
  }

  ngOnInit(): void {}
}
