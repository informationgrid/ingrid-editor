# Extension Points

Extension points are used to add functionality at pre-defined locations in the server application. The functionality is implemented in extensions that are typically activated in some environments only.

## General concept

Extension points are defined by implementing the `ExtensionPoint<T: Extension>` interface and deriving a sub-interface from the `Extension` interface that is used to parametrize this specific extension point. The extension point is established by using an instance of the newly created `ExtensionPoint` implementation at a specific location in the server code. Application developers could then implement the specific `Extension` sub-interface to add custom functionality to that extension point. All classes and interfaces are located in the `de.ingrid.igeserver.extension` package.

The following **example** shows the steps necessary to fulfill the requirement of supporting customer specific export formats:

1. **Define the extension interface** used to implement the specific export formats:

   ```
   interface ExportFormat : Extension {
   
       override val id: String
           get() = this::class.qualifiedName ?: this::class.toString()
     	...
   }
   ```
   The interface provides a default getter for the `id` property, which is useful, if instances are created with spring's `@Autowired` mechanism.
   
2. **Define the extension point** to which the  export format extensions will be registered:

   ```
   @Component
   class Export(@Value("ExportExtensionPoint") override val id: String) : ExtensionPoint<ExportFormat> {
   
       @Autowired(required = false)
       override lateinit var extensions: List<ExportFormat>
       ...
   }
   ```
   The `id` property defaults to *ExportExtensionPoint*, if an instance is created with spring's `@Autowired` mechanism.
   
3. **Establish the extension point** as member variable in the class handling the export process:

   ```
   @Autowired private lateinit var export: Export
   ```
   The `export` variable will receive all `ExportFormat` implementations in the `extensions` property and can choose the appropriate export format from them.
   
4. **Define an extension** for the custom export format:

   ```
   @Component
   class MyExportFormat : ExportFormat {
   
   	companion object {
           private val PROFILES = arrayOf<String>()
       }
   
       override val profiles: Array<String>?
           get() = PROFILES
   	...
   }
   ```

   `MyExportFormat` defines the profiles (document types) with which it can be used in the `PROFILES` member variable. An empty array means that the extension can be used with any profile.


## Pipes and Filters

The server application provides a special extension point that implements the [pipes and filters pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PipesAndFilters.html) and is located in the `de.ingrid.igeserver.extension.pipe` package. This extension point is used at several places, for example to set up filter chains when persisting and publishing documents.

The Pipes and Filters extension point consists of the following main **classes and interfaces**:

- `class Pipe<T: Payload> : ExtensionPoint<Filter<T>>` defines the extension point.
- `interface Payload` defines the actual content to be transferred in a specific pipe.
- `interface Filter<T: Payload> : Extension` defines the interface for filters used in a pipe.

Concrete `Payload` classes are used to bind the filters to the pipes. A `Context` is sent together with the payload through the pipe. It is used to provide and collect additional information.

An **example** of a concrete pipe is the `PreCreatePipe` that is used by `DocumentService` for preparing document data before storing them. It consists of the following parts (see `de.ingrid.igeserver.persistence.filter` package):

- **Pipe**: `@Component class PreCreatePipe : Pipe<PreCreatePayload>("PreCreatePipe")`
- **Payload**:`class PreCreatePayload : Payload`
- **Filter**: `@Component class DefaultDocumentInitializer : Filter<PreCreatePayload>`

Note the `@Component` annotations on the pipe and filter classes that are necessary for spring's `@Autowired` mechanism.

`DocumentService` uses the  `PreCreatePipe` in the following way:

```
@Service
class DocumentService : MapperService() {

	@Autowired private lateinit var preCreatePipe: Pipe<PreCreatePayload>
	
    fun createDocument(data: JsonNode, address: Boolean = false): JsonNode {

		// set up the filter context with the profile derived from the opened catalog
        val filterContext = DefaultContext.withCurrentProfile(dbService)
        
        // get the document type and category of the received data
        val docType = ...
        val category = ...

		// create the payload to be sent through the pipe
        val preCreatePayload = PreCreatePayload(docType, data as ObjectNode, category)

        // run all filters that handle PreCreatePayload and the specified profile
        preCreatePipe.runFilters(preCreatePayload, filterContext)

        // save the document after it passed the pipe
        val newDocument = dbService.save(DocumentType::class, null, preCreatePayload.document.toString())
        ...
    }
    ...
}	
```

