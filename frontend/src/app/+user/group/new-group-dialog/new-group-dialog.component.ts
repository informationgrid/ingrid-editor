import { Component, Inject, OnInit } from "@angular/core";
import { ConfigService } from "../../../services/config/config.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IgeError } from "../../../models/ige-error";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GroupService } from "../../../services/role/group.service";

@Component({
  selector: "ige-new-group-dialog",
  templateUrl: "./new-group-dialog.component.html",
})
export class NewGroupDialogComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl("", Validators.required),
  });

  constructor() {}

  ngOnInit(): void {}
}
