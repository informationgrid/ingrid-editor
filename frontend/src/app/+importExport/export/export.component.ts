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
  exportFormats = this.exportService.getExportTypes();
  formatSelection = 'portal';

  constructor(private _formBuilder: FormBuilder, private exportService: ImportExportService) {
  }

  ngOnInit() {
    this.secondFormGroup = this._formBuilder.group({
      tree: ['dataset', Validators.required],
      drafts: [false]
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
    const options = ImportExportService.prepareExportInfo(this.selectedIds[0], this.formatSelection, this.secondFormGroup.value);
    this.exportService.export(options).subscribe(response => {
      console.log('Export-Result:', response);
      response.text().then(text => this.exportResult = text);
      this.downloadFile(response);
    });
  }

  downloadFile(data: Blob) {
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob([data], {type: 'application/json'}));
    downloadLink.setAttribute('download', 'export.json');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
}
