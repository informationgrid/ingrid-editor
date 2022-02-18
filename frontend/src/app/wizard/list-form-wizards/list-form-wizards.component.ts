import { Component, OnInit } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { DocEventsService } from "../../services/event/doc-events.service";

@Component({
  selector: "ige-list-form-wizards",
  templateUrl: "./list-form-wizards.component.html",
  styleUrls: ["./list-form-wizards.component.css"],
})
export class ListFormWizardsComponent implements OnInit {
  data = {};

  constructor(private docEvents: DocEventsService) {}

  ngOnInit() {
    this.docEvents.afterLoadAndSet$(false).subscribe((data) => {});
  }
}
