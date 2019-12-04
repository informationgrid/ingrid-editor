import {EventManager} from '@angular/platform-browser';
import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Plugin} from './plugin';

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
  isProfileBehaviour?: boolean;
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
    // new AddControlBehaviour( this.formService ),
    // new ShowDateInSectionBehaviour( this.storageService ),
    // new TitleValidatorBehaviour()
  ];

  systemBehaviours: Plugin[] = [
    /*this.deletePlugin,
    this.publishPlugin,
    this.statisticPlugin,
    this.workflowPlugin,
    this.createDocRules,
    this.copyCutPastePlugin,
    this.printviewPlugin,
    this.folderPlugin,
    this.isoviewPlugin,
    this.undoPlugin*/
  ];

  constructor(/*private storageService: DocumentService,
              private statisticPlugin: StatisticPlugin,
              private workflowPlugin: WorkflowPlugin,
              private printviewPlugin: PrintViewPlugin,
              private isoviewPlugin: IsoViewPlugin,
              private createDocRules: CreateDocRulesPlugin,
              private copyCutPastePlugin: CopyCutPastePlugin,
              private folderPlugin: FolderPlugin,
              private publishPlugin: PublishPlugin,
              private deletePlugin: DeleteDocsPlugin,
              private undoPlugin: UndoPlugin*/) {
  }
}
