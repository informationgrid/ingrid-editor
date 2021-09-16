import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "page-template",
  templateUrl: "./page-template.component.html",
  styleUrls: ["./page-template.component.scss"],
})
export class PageTemplateComponent implements OnInit {
  @Input() label = "";
  @Input() subLabel = "";
  @Input() noHeader = false;

  constructor() {}

  ngOnInit(): void {}
}
