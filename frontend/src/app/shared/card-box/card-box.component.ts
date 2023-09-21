import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-card-box",
  templateUrl: "./card-box.component.html",
  styleUrls: ["./card-box.component.scss"],
})
export class CardBoxComponent implements OnInit {
  @Input() label: string;

  // button besides label, if provided
  @Input() endBtnTitle: string;
  @Output() endBtnOnClick = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
