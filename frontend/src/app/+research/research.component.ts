import { Component, OnInit } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-research",
  templateUrl: "./research.component.html",
  styleUrls: ["./research.component.scss"],
})
export class ResearchComponent implements OnInit {
  tabs = [
    { label: "Erweiterte Suche", path: "search" },
    { label: "SQL Suche", path: "sql" },
    { label: "Gespeicherte Suchen", path: "queries" },
  ];

  constructor() {}

  ngOnInit() {}
}
