import { Component, OnInit } from '@angular/core';

export type VersionConflictChoice = 'cancel' | 'force' | 'reload';

@Component({
  selector: 'ige-version-conflict-dialog',
  templateUrl: './version-conflict-dialog.component.html',
  styleUrls: ['./version-conflict-dialog.component.scss']
})
export class VersionConflictDialogComponent implements OnInit {
  options = [
    { label: 'Speichern abbrechen', value: 'cancel' },
    { label: 'Trotzdem speichern und Änderungen vom anderen Nutzer verwerfen', value: 'force' },
    { label: 'Den Datensatz neu laden', value: 'reload' }
  ];
  choice: string;

  constructor() { }

  ngOnInit(): void {
  }

}
