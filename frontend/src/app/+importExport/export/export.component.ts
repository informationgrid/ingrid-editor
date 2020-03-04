import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ImportExportService} from '../import-export-service';

@Component({
  selector: 'ige-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {

  selection: any[] = [];
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  selectedOption: any;
  datasetSelected = false;
  private selectedIds: string[];

  constructor(private _formBuilder: FormBuilder, private exportService: ImportExportService) {
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      option: ['', Validators.required]
    });
  }

  handleSelected(nodes) {
    this.selection = nodes;
  }

  selectDatasets(ids: string[]) {
    this.datasetSelected = true;
    this.selectedIds = ids;
  }

  runExport() {
    this.exportService.export(this.selectedIds[0]).subscribe(response => {
      console.log('Export-Result:', response);
    });
  }
}
