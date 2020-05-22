# Create a new page

* create a new module under app (e.g. AddressModule)
* rename created folder "address" to "+address" to show that it's a page
* create a new component under app/+address (e.g. AddressComponent)
* create a new file "address.routing.ts" with content:
```
export const routing = RouterModule.forChild( [
  {
    path: '',
    component: AddressComponent,
    canActivate: [AuthGuard]
  }
] );
```
* put exported constant inside "import" of the module
* add page to main router (app.router.ts) with configuration

# Add a new toolbar button

* create a new file "<name>.plugin.ts" in a subdirectory of "+forms/dialogs"
* extend class from "Plugin"
* add button with FormToolbarService
* react on event from FormToolbarService using eventId of defined button
* add Plugin to providers in "form-plugin.provider.ts"

# Use a behaviour function for calculations, filtering, ...

When we want to add a configurable behaviour only to specify a different calulation, filtering
or sorting, then it's recommended to provide this in a service, which can be overriden by a
behaviour.

Take care of multiple changes by different behaviours and inform the user!

An example can be seen in tree.service.ts.

# Intercept other functionality and conditionally prevent execution

Use the event-service to send events and wait for the responses of all subscribers.
See the following example:

* if we want to execute code only if all subscribers of an event agree:
  ```
  this.eventService.sendEventAndContinueOnSuccess(IgeEvent.DELETE)
            .subscribe(() => this.showDeleteDialog());
  ```
* a behaviour which want to allow the showing of the delete dialog only if the folder has no children:
  ```
  this.eventService.respondToEvent(IgeEvent.DELETE)
            .subscribe(resultObserver => {
                // do some checks and/or show an alternative dialog
  
                const responseData = this.buildResponse(success);
                resultObserver(responseData);
            });
  ```
