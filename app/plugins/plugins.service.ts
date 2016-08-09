import { Injectable } from '@angular/core';
import {StatisticPlugin} from './statistic/statistic.plugin';
import {WorkflowPlugin} from './workflow/workflow.plugin';
import {DemoPlugin} from './demo/demo.plugin';

@Injectable()
export class PluginsService {

    constructor(private statPlugin: StatisticPlugin, private workflowPlugin: WorkflowPlugin, private demoPlugin: DemoPlugin) { }

    getPlugins(): any[] {
      return [
        this.statPlugin,
        this.workflowPlugin,
        this.demoPlugin
      ];
    }

}