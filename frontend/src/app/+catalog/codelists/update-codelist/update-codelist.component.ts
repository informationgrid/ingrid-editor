import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CodelistEntry} from '../../../store/codelist/codelist.model';

@Component({
  selector: 'ige-update-codelist',
  templateUrl: './update-codelist.component.html',
  styleUrls: ['./update-codelist.component.scss']
})
export class UpdateCodelistComponent implements OnInit {
  model: CodelistEntry;
  fields: any[];
  isNew = true;

  constructor(@Inject(MAT_DIALOG_DATA) public entry: CodelistEntry,
              private dialogRef: MatDialogRef<UpdateCodelistComponent>) {
    this.model = {...entry};
    this.isNew = entry.id === undefined;
    this.fields = Object.keys(entry.fields).map(key => ({
      key: key,
      value: entry.fields[key]
    }));
  }

  ngOnInit(): void {
  }

  addEntry() {
    this.fields.push({});
  }

  closeWithResult() {
    this.model.fields = this.fields.reduce((previousValue, currentValue) => {
      previousValue[currentValue.key] = currentValue.value;
      return previousValue;
    }, {});
    this.dialogRef.close(this.model);
  }

  removeEntry(index: number) {
    this.fields.splice(index, 1);
  }
}
