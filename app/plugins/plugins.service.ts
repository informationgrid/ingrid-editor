import { Injectable } from '@angular/core';
import {StatisticPlugin} from './statistic/statistic.plugin';
import {WorkflowPlugin} from './workflow/workflow.plugin';

@Injectable()
export class PluginsService {

    constructor(private statPlugin: StatisticPlugin, private workflowPlugin: WorkflowPlugin) { }

    getPlugins(): any[] {
      return [
        this.statPlugin,
        this.workflowPlugin
      ];
    }

}