import { Component, Input, OnInit } from "@angular/core";
import { FileUploadModel } from "../fileUploadModel";

@Component({
  selector: "ige-upload-item",
  templateUrl: "./upload-item.component.html",
  styleUrls: ["./upload-item.component.scss"],
})
export class UploadItemComponent implements OnInit {
  @Input() file: FileUploadModel;

  constructor() {}

  ngOnInit(): void {}

  retryFile(file: FileUploadModel) {}

  cancelFile(file: FileUploadModel) {}
}
