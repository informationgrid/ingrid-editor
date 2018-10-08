
class ExportUtils {

  getOrCreatePosition(target, ...nodes) {
    let newTarget = target;
    nodes.forEach( node => {
      // check if target already has this node
      let presentNode = this.getChildByTag(newTarget, node);
      if (presentNode) {
        newTarget = presentNode;
      } else {
        newTarget = newTarget.ele( node );
      }
    });
    return newTarget;
  }

  getChildByTag(parent, child) {
    return parent.children.find( c => {
      return c.name === child;
    });
  }

}

module.exports = new ExportUtils();
