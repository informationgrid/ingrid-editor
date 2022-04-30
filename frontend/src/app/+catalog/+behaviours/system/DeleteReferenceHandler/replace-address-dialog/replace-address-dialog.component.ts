import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ige-replace-address-dialog",
  templateUrl: "./replace-address-dialog.component.html",
  styleUrls: ["./replace-address-dialog.component.scss"],
})
export class ReplaceAddressDialogComponent implements OnInit {
  page: number = 0;
  selectedAddress: any[];

  constructor() {}

  ngOnInit(): void {}

  pan($event) {}
}
