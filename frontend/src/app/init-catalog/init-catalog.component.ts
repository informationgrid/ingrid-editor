import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ConfigService } from "../services/config/config.service";

@Component({
  selector: "ige-init-catalog",
  templateUrl: "./init-catalog.component.html",
  styleUrls: ["./init-catalog.component.scss"],
})
export class InitCatalogComponent implements OnInit {
  constructor(private route: ActivatedRoute, private config: ConfigService) {
    console.log("params: ", this.route.snapshot.params);
    console.log("currentCatalog: ", config.$userInfo.value.currentCatalog);
    console.log("assignedCatalogs: ", config.$userInfo.value.assignedCatalogs);
    console.log(
      "catalog match?",
      config.$userInfo.value.assignedCatalogs.find(
        (cat) => cat.id === this.route.snapshot.params.catalog
      ) !== undefined
    );
  }

  ngOnInit(): void {}
}
