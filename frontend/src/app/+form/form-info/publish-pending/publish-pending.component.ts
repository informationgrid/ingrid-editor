import { Component, Input, OnInit } from "@angular/core";
import { IgeDocument } from "../../../models/ige-document";
import { DocumentService } from "../../../services/document/document.service";

@Component({
  selector: "ige-publish-pending",
  templateUrl: "./publish-pending.component.html",
  styleUrls: ["./publish-pending.component.scss"],
})
export class PublishPendingComponent implements OnInit {
  @Input() doc: IgeDocument;
  @Input() forAddress: boolean;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {}

  stopPublish() {
    this.documentService
      .cancelPendingPublishing(this.doc._id, this.forAddress)
      .subscribe();
  }
}
