# Installation

> npm install
> npm typings install

# Test

> npm test

# Development Mode

> npm run dev

# Add Typing

> typings install dt~geojson --global


# Concepts

## Additional behaviours/fields

The page should have a wizard like layout:

- choose if field or behaviour shall be created
  - for a field choose field type, id, label, width in percent and required state (if supported)
- possible to add multiple actions or just define multiple behaviours?
- choose when action shall be executed
  - Page should show a list of all fields, which can be combined with an event action, e.g 'click', 'change', ...
  - onSave
  - onPublish
- give a name/description to the behaviour
- text area with code to be executed

These behaviours are saved in the backend, which decides if it's stored in a database, so that each additional behaviour can reside in a 'catalog' or if it should be accessible by all.

## Workflow

Instead of saving a document immediately it only will be marked as saved and must be verified by another person who has the role to save/publish the document finally.

This plugin can be an extension of the pubish plugin, since the user must be able to save data normally and have another action to mark the document ready for QA.