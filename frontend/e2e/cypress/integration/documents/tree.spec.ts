describe('Tree', () => {
  xit('should navigate to a section when clicking on form header navigation', () => {

  });

  // ...
  xit('should expand and select the same node when reloading page', () => {

  });

  xit('should show search results in tree search', () => {

  });

  xit('should show empty search input field when clicking on x-button', () => {

  });

  describe('Copy', () => {
    xit('should not be possible to copy a root node under the root node', () => {

    });

    xit('should not be possible to copy a node inside a folder into the same one', () => {

    });

    xit('should not be possible to copy a document/folder under a document', () => {
      // only folders can contain sub-elements
    });

    xit('should copy a root document into a folder', () => {

    });

    xit('should copy a root document into a deeply nested folder', () => {

    });

    xit('should copy a document from a folder to the root', () => {

    });

    xit('should copy a root folder (without sub-tree) into a folder', () => {

    });

    xit('should copy a root folder (with sub-tree) into a folder', () => {

    });
  });

  describe('Cut', () => {
    xit('should be possible to move a root node under the root node', () => {
      // at the moment it's allowed since there's no harm
    });

    xit('should be possible to move a node inside a folder into the same one', () => {
      // at the moment it's allowed since there's no harm

    });

    xit('should move a root document into a folder', () => {

    });

    xit('should move a root document into a deeply nested folder', () => {

    });

    xit('should move a document from a folder to the root', () => {

    });

    xit('should move a root folder into a folder', () => {

    });

  });

  describe('DragnDrop', () => {

    xit('should move a document into an opened folder', () => {

    });

    xit('should move a document into a deeply nested folder by auto-expanding of hovered node', () => {

    });

    xit('should move a document into a not expanded node (other children should be there)', () => {
      // when dragging a node onto a folder, the folder expands automatically after a few milliseconds

      // when we drop the document before the folder is expanded, then it happened the new moved node was the only
      // one under the parent folder

      // make sure that after move, all other expected children are available under the destination folder
    });


  });


});
