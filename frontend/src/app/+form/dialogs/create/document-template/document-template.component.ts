import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "ige-document-template",
  templateUrl: "./document-template.component.html",
  styleUrls: ["./document-template.component.scss"],
})
export class DocumentTemplateComponent implements OnInit {
  @Input() documentTypes: Observable<DocumentAbstract[]>;
  @Input() form: FormGroup;

  @Output() create = new EventEmitter();
  @Output() docType = new EventEmitter();

  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );

  constructor() {}

  ngOnInit(): void {}
}
