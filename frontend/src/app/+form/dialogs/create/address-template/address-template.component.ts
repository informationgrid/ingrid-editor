import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "ige-address-template",
  templateUrl: "./address-template.component.html",
  styleUrls: ["./address-template.component.scss"],
})
export class AddressTemplateComponent implements OnInit {
  @Input() documentTypes: Observable<DocumentAbstract[]>;
  @Input() form: FormGroup;
  @Input() isPerson: boolean;

  @Output() create = new EventEmitter();
  @Output() docType = new EventEmitter();

  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );
  addressOnlyOrganization = false;
  infoText: any;

  constructor() {}

  ngOnInit(): void {
    // this.infoText =
    //   "Legen Sie eine Organisation an.<br />Tragen Sie dafür die Organisationsbezeichnung ein.";
    // Legen Sie eine Person oder Organisation an.<br />Tragen Sie dafür den Namen oder die Organisationsbezeichnung ein.
  }
}
