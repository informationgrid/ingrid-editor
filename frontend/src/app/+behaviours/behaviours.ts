import {FormularService} from '../services/formular/formular.service';
import {EventManager} from '@angular/platform-browser';
import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {AddControlBehaviour} from './system/demo/behaviours/AddControl/addControl.behaviour';
import {DocumentService} from '../services/document/document.service';
import {ShowDateInSectionBehaviour} from './form/ShowDateInSection/show-date-in-section.behaviour';
import {TitleValidatorBehaviour} from './form/TitleValidator/title-validator.behaviour';
import {Plugin} from './plugin';
import {
  CopyCutPastePlugin,
  CreateDocRulesPlugin,
  PrintViewPlugin,
  PublishPlugin,
  StatisticPlugin,
  WorkflowPlugin,
  FolderPlugin,
  UndoPlugin
} from '.';
import {DeleteDocsPlugin} from './toolbar/deleteDocs/delete-docs.plugin';
import {IsoViewPlugin} from './toolbar/isoView/iso-view.plugin';

export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  forProfile?: string;
  isActive?: boolean;
  register: (form: FormGroup, eventManager: EventManager) => void;
  unregister: () => void;
  controls?: any[];
  outer?: any;
  _state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BehavioursDefault {

  /**
   * The definition of all behaviours.
   */
  behaviours: Behaviour[] = [
    // new ClickAndChangeTitleBehaviour( this.storageService ),
    // new MapAndChangeTitleBehaviour( this.formService ),
    // new OpenDataBehaviour(this.storageService),
    new AddControlBehaviour( this.formService ),
    new ShowDateInSectionBehaviour( this.storageService ),
    new TitleValidatorBehaviour()
  ];

  systemBehaviours: Plugin[] = [
    this.deletePlugin,
    this.publishPlugin,
    this.statisticPlugin,
    this.workflowPlugin,
    this.createDocRules,
    this.copyCutPastePlugin,
    this.printviewPlugin,
    this.folderPlugin,
    this.isoviewPlugin,
    this.undoPlugin
  ];

  constructor(private formService: FormularService,
              private storageService: DocumentService,
              private statisticPlugin: StatisticPlugin,
              private workflowPlugin: WorkflowPlugin,
              private printviewPlugin: PrintViewPlugin,
              private isoviewPlugin: IsoViewPlugin,
              private createDocRules: CreateDocRulesPlugin,
              private copyCutPastePlugin: CopyCutPastePlugin,
              private folderPlugin: FolderPlugin,
              private publishPlugin: PublishPlugin,
              private deletePlugin: DeleteDocsPlugin,
              private undoPlugin: UndoPlugin) {
  }
}
