import { Component, OnInit } from "@angular/core";

@Component({
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"],
})
export class OverviewComponent implements OnInit {
  activeLink = "import";

  tabs = [
    { label: "Import", path: "import" },
    { label: "Export", path: "export" },
  ];

  ngOnInit(): void {}
}
