import { Component, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { GroupService } from "../../../services/role/group.service";
import { Group } from "../../../models/user-group";
import { ModalService } from "../../../services/modal/modal.service";
import { MatDialogRef } from "@angular/material/dialog";
import { GroupQuery } from "../../../store/group/group.query";

@Component({
  selector: "ige-new-group-dialog",
  templateUrl: "./new-group-dialog.component.html",
})
export class NewGroupDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    name: new UntypedFormControl("", Validators.required),
  });

  groups = this.groupQuery.getAll();

  constructor(
    private groupService: GroupService,
    private groupQuery: GroupQuery,
    private modalService: ModalService,
    public dialogRef: MatDialogRef<NewGroupDialogComponent>,
  ) {}

  ngOnInit(): void {}

  createGroup() {
    const newGroup = new Group({
      id: null,
      name: this.form.value.name,
    });
    if (this.groups?.filter((group) => group.name === newGroup.name).length) {
      this.modalService.showJavascriptError(
        "Es existiert bereits eine Gruppe mit diesem Namen",
      );
    } else {
      this.groupService.createGroup(newGroup).subscribe((group) => {
        this.dialogRef.close(group);
      });
    }
  }
}
