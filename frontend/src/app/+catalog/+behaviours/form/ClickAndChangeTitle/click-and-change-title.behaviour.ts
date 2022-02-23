import { EventManager } from "@angular/platform-browser";
import { FormGroup } from "@angular/forms";
import { BaseBehaviour } from "../../base.behaviour";
import { Inject } from "@angular/core";
import { Behaviour } from "../../../../services/behavior/behaviour";
import { DocEventsService } from "../../../../services/event/doc-events.service";

/**
 * OpenDataBehaviour
 */
export class ClickAndChangeTitleBehaviour
  extends BaseBehaviour
  implements Behaviour
{
  id = "clickAndChangeTitle";
  title = "Click and change title + onSave validator";
  description = "...";
  defaultActive = true;
  forProfile = "UVP";

  constructor(@Inject(DocEventsService) private docEvents: DocEventsService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    const taskEl = <HTMLElement>document.querySelector("#taskId");
    this.addListener(
      eventManager.addEventListener(taskEl, "click", function () {
        console.log("Element was clicked");
        form
          .get(["mainInfo", "title"])
          .setValue("remotely updated by behaviour");
      })
    );

    this.addSubscriber(
      this.docEvents.beforePublish$(false).subscribe((message: any) => {
        message.errors.push({ id: "taskId", error: "I don't like this ID" });
        console.log("in observer");
      })
    );
  }
}
