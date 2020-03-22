import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ImportExportService} from '../import-export-service';

@Component({
  selector: 'ige-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  selection: any[] = [];
  secondFormGroup: FormGroup;
  datasetSelected = false;
  private selectedIds: string[];
  exportResult: any;
  exportFormats = [{ value: 'portal', label: 'mCLOUD Portal'}];
  formatSelection = 'portal';

  constructor(private _formBuilder: FormBuilder, private exportService: ImportExportService) {
  }

  ngOnInit() {
    this.secondFormGroup = this._formBuilder.group({
      option: ['dataset', Validators.required]
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
    let options = ImportExportService.prepareExportInfo(this.selectedIds[0], this.formatSelection);
    this.exportService.export(options).subscribe(response => {
      console.log('Export-Result:', response);
      this.exportResult = response;
    });
  }
}
