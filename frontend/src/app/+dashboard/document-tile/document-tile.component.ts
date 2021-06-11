import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "ige-document-tile",
  templateUrl: "./document-tile.component.html",
  styleUrls: ["./document-tile.component.css"],
})
export class DocumentTileComponent implements OnInit {
  @Input() document: any;
  constructor() {}

  ngOnInit() {}
}
