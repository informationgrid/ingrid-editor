import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "page-template-no-header",
  templateUrl: "./page-template-no-header.component.html",
  styleUrls: ["./page-template.component.scss"],
})
export class PageTemplateNoHeaderComponent implements OnInit {
  @Input() label = "";
  @Input() subLabel = "";

  constructor() {}

  ngOnInit(): void {}
}
