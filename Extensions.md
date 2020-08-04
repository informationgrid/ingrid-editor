# Extension Points

Extension points are a typical approach to solve the problem of **varying requirements for several application aspects** (e.g. data import-/export formats or data validation). The idea is to define places in the application - the extension points - where so-called extensions can add or alter the default functionality. Each extension implements it's own requirements according to the specific extension point and the behavioral variation of the extension point is achieved by activating the extension in some environments and deactivating it in others.

## General concept

An **Extension point** in IGE Server is **defined** by two concepts:

- A class implementing the `ExtensionPoint<T: Extension>` interface which holds the extensions and gives access to them.
- A sub-interface of `Extension` used as type parameter for the extension point which means that only extensions implementing this interface will be available at that extension point.

The extension point is **established** by using an instance of the extension point class at a specific location in the server code (e.g. the data exporter). Application developers could then implement the related extension sub-interface to add custom functionality to that extension point.

All extension related classes and interfaces of IGE Server are located in the `de.ingrid.igeserver.extension` package.

#### Profiles

A key aspect of IGE Server's data model is the support for different document types that are related to a single or multiple so-called **profile(s)**. Since extensions are typically used in data processing application aspects, the `Extension` interface defines a `profiles` property which is used to define for which profiles the concrete extension is used. The possible values of the profile property have the following meanings in the context of the profile associated with the processed data (*data profile*):

- *Empty list*: The extension is used with all data profiles (also when the data profile is not specified)
- *List of profile names*: The extension is only used if the data profile is equal to one of the listed profiles (not when the data profile is not specified)
- *Null*: The extension is not used with any profile (also not when the data profile is not specified)

### Example

The following example shows the steps necessary to define an extension point for supporting **customer specific export formats**:

1. **Define the extension interface** used to implement the specific export formats:

   ```
   interface ExportFormat : Extension {
   
       override val id: String
           get() = this::class.qualifiedName ?: 
                   this::class.toString()
           
       // export specific methods to be called 
       // on the data, e.g. writeData()
     	...
   }
   ```

   NOTE: The interface provides a default getter for the extension's `id` property, which is useful, if instances are created with Spring's `@Autowired` mechanism.
   
2. **Define the extension point** to which the  export format extensions will be registered:

   ```
   @Component
   class Export(@Value("ExportExtensionPoint") override val id: String) : 
       ExtensionPoint<ExportFormat> {
   
       @Autowired(required = false)
       override lateinit var extensions: List<ExportFormat>
       
       // extension point specific methods to be used to access the extensions
       // and their functionality, e.g. getFormatByName()
       ...
   }
   ```

   NOTE: The `id` property of the extension point defaults to *ExportExtensionPoint*, if an instance is created with Spring's `@Autowired` mechanism.
   
3. **Establish the extension point** as member variable in the class that handles the export process:

   ```
   @Service
   class Exporter {
   
       @Autowired private lateinit var export: Export
       ...
   }
   
   ```

   The `Export` instance named `export` will receive all `ExportFormat` implementations in it's `extensions` property and can choose the appropriate export format from them.
   
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

   `MyExportFormat` defines the profiles with which it can be used in the `PROFILES` member variable. The empty array means that the extension can be used with any profile.


## Pipes and Filters

The IGE Server code provides a **special extension point type** that implements the [pipes and filters pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PipesAndFilters.html) for sequentially validating and transforming data in a flexible way. This extension point type is used at several places of the application, for example to set up filter chains when persisting and publishing documents. The classes and interfaces are located in the `de.ingrid.igeserver.extension.pipe` package. 

IGE Server's pipes and filters implementation applies the two extension point concepts mentioned above as follows:

- The class `Pipe<T: Payload> : ExtensionPoint<Filter<T>>` implements the extension point interface and expects the extensions to be of type `Filter`.
- The interface `Filter<T: Payload> : Extension, (T, Context) -> T` defines the interface for extensions (aka filters) used at the extension point. Each filter must implement the `invoke()` method that is called by the pipe instance when running the contained filters using the `runFilters()` method.

#### Payload and Context

An additional concept is that of a payload that contains the **data to be processed** by the filters of a pipe. The fact that each pipe will typically handle a specific payload requires to bind payload specific filters to payload specific pipes. This is done by defining a sub-interface of the `Payload` interface for each pipe (e.g. *pre* update pipe uses *PreUpdatePayload*, *post* update pipe uses *PostUpdatePayload*). Parameterizing the pipe and the related filters with this sub-interface ensures that only matching filters run in a pipe. Inheritance of payloads and filters allows for flexible configuration and code-reuse.

When a pipe runs it's filters, a `Context` is sent together with the payload through the pipe. It is used to provide additional information (e.g. the data profile) and collect results (e.g. status messages or properties passed between filters). Although `Context` is defined as an interface, there only exists the `DefaultContext` implementation by now.

#### Configuration

Pipes and filters are configured mainly using Spring's dependency injection with `@Autowired` and `@Value` annotations together with payload specific interfaces. But there are concerns that are preferable defined in an environment specific configuration file rather than in code: 

- **Filter sequence**: The order in which filters are applied to a payload is significant in some situations. It can be defined in the `pipes.filter.order` application property like the following:

  ```
  pipes.filter.order={'pipeId1': {'filterA','filterB'}, 'pipeId2': {'filterD','filterC'}}
  ```

  Filters that are not mentioned in the configuration are applied after mentioned filters. The following configuration ensures that data is validated *before* updating.

  ```
  pipes.filter.order={\
    'PreUpdatePipe': {\
      'de.ingrid.igeserver.persistence.filter.DefaultUpdateValidator',\
      'de.ingrid.igeserver.persistence.filter.DefaultDocumentUpdater'\
    }\
  }
  ```

- **Filter presence**: The `pipes.filter.disabled` application property can be used to deactivate specific filters in a pipe:

  ```
  pipes.filter.disabled={'pipeId1': {'filterA'}, 'pipeId2': {'filterC'}}
  ```

NOTE: Pipes and filters are identified by their `id` property. Both properties are optional and they are typically defined in the `application.properties` file.

### Example

An example of a concrete pipe is the `PreCreatePipe` that is used by `DocumentService` for preparing document data before storing them. It consists of the following parts (see `de.ingrid.igeserver.persistence.filter` package):

- **Payload** (data)

  ```
  open class PreCreatePayload : Payload
  ```

  NOTE: Constructor parameters and the base class `PersistencePayload` are left out for for the sake of simplicity.

- **Pipe** (extension point)

  ```
  @Component class PreCreatePipe : Pipe<PreCreatePayload>("PreCreatePipe")
  ```

- **Filter** (extension)

  ```
  @Component class DefaultDocumentInitializer : Filter<PreCreatePayload> {
  
      override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
          context.addMessage(Message(this, "Initialize document data before insert"))
          ...
          return payload
      }
      ...
  }
  ```

NOTE: `@Component` annotations on the pipe and filter classes are necessary for Spring's `@Autowired` mechanism.

The following code demonstrates how `DocumentService` uses the  `PreCreatePipe` when creating documents:

```
@Service
class DocumentService : MapperService() {

    // set up the pipe instance
    @Autowired private lateinit var preCreatePipe: PreCreatePipe
    // ... or to be more explicit about the payload type
    // @Autowired private lateinit var preCreatePipe: Pipe<PreCreatePayload>

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