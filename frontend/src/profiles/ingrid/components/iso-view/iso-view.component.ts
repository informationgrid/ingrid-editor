import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { diffLines } from "diff";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatButtonModule } from "@angular/material/button";
import { NgIf } from "@angular/common";

@Component({
  templateUrl: "./iso-view.component.html",
  styleUrls: ["./iso-view.component.scss"],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    NgIf,
  ],
  standalone: true,
})
export class IsoViewComponent implements OnInit {
  isoText: any;
  isoTextPublished: any;
  compareView = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.isoText = this.data.isoText;
    this.isoTextPublished = this.data.isoTextPublished;
    if (this.isoTextPublished) {
      this.calculateDiff();
    }
  }

  calculateDiff() {
    const diffs = diffLines(this.isoTextPublished, this.isoText);
    let pre = null;
    const diffView = document.getElementById("diffView"),
      fragment = document.createDocumentFragment();
    diffs.forEach((part) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      pre = document.createElement("pre");
      pre.style.color = color;
      pre.appendChild(document.createTextNode(part.value));
      fragment.appendChild(pre);
    });
    diffView.appendChild(fragment);
  }
}
