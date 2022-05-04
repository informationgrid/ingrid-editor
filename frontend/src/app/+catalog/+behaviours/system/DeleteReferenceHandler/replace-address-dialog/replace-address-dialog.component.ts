import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { tap } from "rxjs/operators";

export interface ReplaceAddressDialogData {
  source: string;
  showInfo: boolean;
}

@Component({
  selector: "ige-replace-address-dialog",
  templateUrl: "./replace-address-dialog.component.html",
  styleUrls: ["./replace-address-dialog.component.scss"],
})
export class ReplaceAddressDialogComponent implements OnInit {
  page = 0;
  selectedAddress: string[];

  private source: string;
  showInfo = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReplaceAddressDialogData,
    private documentService: DocumentService
  ) {
    this.source = data.source;
    this.showInfo = data.showInfo;
  }

  ngOnInit(): void {}

  replaceAddress() {
    this.documentService
      .replaceAddress(this.source, this.selectedAddress[0])
      .pipe(tap(() => this.reloadAddress()))
      .subscribe(() => this.page++);
  }

  private reloadAddress() {
    this.documentService.reload$.next({
      uuid: this.source,
      forAddress: true,
    });
  }
}
