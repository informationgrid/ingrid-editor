# Create a new profile

## Frontend

Create a new Module with a component inside "`src/profiles`" - directory. For an example look at the file
"`profile-mcloud.ts`".

The ProfileService dynamically loads a profile during load of the website, using the catalog type 
(`profile-<type>.ts`), which comes from the backend. For example, if a catalog of type "mcloud" is used, 
then the file "`profile-mcloud.ts`" is loaded.

In the profile a component is defined which has to load all the document types, that are used in that
profile. Normally you need the FolderDoctype, AdressDoctype and one to put your data in. For an example 
have a look at `mcloud.doctype.ts`

The form fields are defined by using the [ngx-formly](https://formly.dev/guide/getting-started) library.
Besides using standard from fields you can also define your own. Your custom field component must extend
from `FieldType` and has to be declared in `IgeFormlyModule`.  

For a correct integration of a field into the form, you need to use the wrappers-field and set it to 
`['panel']`. This will use a component (OneColumnWrapperComponent) to place the form field in a defined
order, so that on the left side the label is placed and to the right the configured form field(s).

You can also define frontend validation for each form field. Please check out the library website and the
currently implemented doctypes. 

## Backend

In the backend create a new package under `de/ingrid/igeserver/profiles/<profile-name>`. Inside the 
types-package create a new interface of your type which extends `EntityType`. The implementation needs
to extend from `OrientDBDocumentEntityType`. Have a look at `MCloudType.kt`.

### Export

For the export feature add a service inside the exporter-package which implements `IgeExporter`.
Pebbles template engine is used for easier export. Check out `PortalExporter`.

# Add / Update / Remove form field

Open the according document type file under `de/ingrid/igeserver/profiles/<profile-name>` and edit the
`documentFields`-function. Check out the [ngx-formly](https://formly.dev/guide/getting-started) website
how to configure a form field.

Also check out some basics in the section "Create a new profile".

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

# Migration for a specific version

When there's a need to change the database structure or we need to migrate some data then we can use the
migration tasks.

Go to the package `de/ingrid/igeserver/migrations/tasks` and create a new task with the following name scheme:

`M<version>_<title>.kt`

and implement something like this example for a migration to version 0.17:
```kotlin
@Service
class M017_TestMigration : MigrationBase("0.17") {

    private var log = logger()

    override fun exec(databaseName: String) {
        log.info("Executing migration 0.17")
    }

}
```
# Creating a cron task

If you want to create a task which is executed at a certain time also repeatable, then do the following:

* go to `de/ingrid/igeserver/tasks`
* create a new component annotated class
* add a function with the following annotation
`@Scheduled(cron = "\${cron.codelist.expression}")` 
where "cron.codelist.expression" should be replaced by a property from the application.properties file.
An example would look like this
```properties
# scheduler: second, minute, hour, day of month, month, day(s) of week
cron.codelist.expression=0 */30 * * * *
```

# Add a new SVG icon

New Icons added to IGE-NG should be integrated the following way:

* clean SVG file with online tool: https://jakearchibald.github.io/svgomg/
* choose an appropriate symbol catalog in `src/assets/icons`
* add SVG source content from online tool to symbol catalog
* replace svg-tag with symbol-tag
* add classes for easier styling to relevant svg-paths
  * **coloring**: for changing the fill color
  * **coloring-stroke**: for changing the stroke style
  
For easier editing you can format the file but remember to minimize it afterwards (IntelliJ: Select all + "Join Lines")
