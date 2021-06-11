import { Component, OnInit } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";

@Component({
  selector: "ige-list-form-wizards",
  templateUrl: "./list-form-wizards.component.html",
  styleUrls: ["./list-form-wizards.component.css"],
})
export class ListFormWizardsComponent implements OnInit {
  data = {};

  constructor(private storageService: DocumentService) {}

  ngOnInit() {
    this.storageService.afterLoadAndSet$.subscribe((data) => {});
  }
}
