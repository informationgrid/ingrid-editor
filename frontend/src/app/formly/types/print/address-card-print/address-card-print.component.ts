import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";

@Component({
  selector: "ige-address-card-print",
  templateUrl: "./address-card-print.component.html",
  styleUrls: ["./address-card-print.component.scss"],
})
export class AddressCardPrintComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}
}
