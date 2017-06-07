let glob = require('glob')
  , path = require('path'),
  log = require('log4js').getLogger();;

let validate = require("validate.js");

/**
 * Class to handle the validation of a document.
 * Depending on the configuration other validation rules might apply.
 * The constraints are built on startup and if a behaviour was activated or deactivated. These constraints are then used
 * to check against the document.
 * We use the validatejs library: https://validatejs.org/
 */
class Validator {

  /*
  The constraints holds all validation information for all document profiles.
  <profile_name>: {
    <field_name>: [func1, func2, ...]
  }
   */

  constructor() {
    this.constraints = {};
    this.priorityMap = {};

    let activeRules = [];
    let inactiveRules = [];

    glob.sync('./validation/rules/**/*.js').forEach(file => {
      log.debug('loading rule: ', file);
      let rule = require(path.resolve(file));

      // if it's the first rule for a profile
      if (!this.constraints[rule.profile]) {
        this.constraints[rule.profile] = {};
      }

      // if it's a new rule for a field
      let constraintField = this.constraints[rule.profile][rule.field];
      if (!constraintField) {
        this.constraints[rule.profile][rule.field] = constraintField = {};
      }

      if (typeof rule.validate === 'object') {
        let keys = Object.keys(rule.validate);
        keys.forEach(key => {

          // check if rule was deactivated by a corresponding behaviour
          let isActive = this.checkActive(rule.linkToBehaviour);

          // check priority first
          let hasPriority = this.checkPriority(rule.profile, rule.field, key, rule.priority);

          if (isActive && hasPriority) {
            constraintField = this.addOrMergeRule(key, constraintField, rule.validate);
            activeRules.push(file + ' -> ' + key);
          } else {
            let text = isActive ? '' : ' behaviour is not active: ' + rule.linkToBehaviour;
            text += hasPriority ? '' : ' has lower priority';
            inactiveRules.push(file + ' -> ' + key + text);
          }

        });

      } else {
        log.error('Strange validate object: ', rule.validate);
      }
    });
    log.debug('Activated rules:\n', activeRules.join('\n'));
    log.debug('Deactivated rules:\n', inactiveRules.join('\n'));
  }

  /**
   *
   * @param doc
   * @returns {Promise}
   */
  run(doc) {
    let errors = validate.validate(doc, this.constraints[doc._profile]);

    return new Promise(function (resolve, reject) {
      if (errors) {
        reject(errors);
      } else {
        resolve(errors);
      }
    });
  }

  /**
   * Get the constraints for a specific profile. For each field of a document one or more rules can be applied.
   * So in the validate function we have to iterate through all defined constraints  and call those.
   * @returns {{}}
   */

  /*prepareConstraints() {
    let result = {};


    for (let i = 0; i < this.constraints.length; i++) {
      // TODO: only add validator if constraint is active (check in settings)
      let key = this.constraints[i].key;
      if (result[key]) {
        // merge constraint with existing ones
      } else {
        // add new constraint
      }
    }

    return result;
  }*/

  /**
   * Register a contraint for a profile and a field of the document.
   * @param {string}profile
   * @param {string} field
   * @param {function} constraint
   */
  register(profile, field, constraint) {
    this.constraints[profile][field].push(constraint);
  }

  addOrMergeRule(key, constraintField, validate) {
    if (constraintField[key] === undefined) {
      constraintField[key] = validate[key];
    } else {
      constraintField[key] = validate[key];
    }
    return constraintField;
  }

  checkPriority(profile, field, key, priority) {
    this.preparePriorityMap(profile, field, key);

    if (this.priorityMap[profile][field][key].priority === undefined
      || this.priorityMap[profile][field][key].priority < priority) {

      this.priorityMap[profile][field][key].priority = priority;
    } else {
      // only return false if a rule does not have a higher priority!
      return false;
    }

    return true;
  }

  preparePriorityMap(profile, field, key) {
    if (!this.priorityMap[profile]) {
      this.priorityMap[profile] = {};
      this.priorityMap[profile][field] = {};
      this.priorityMap[profile][field][key] = {};
    } else if (!this.priorityMap[profile][field]) {
      this.priorityMap[profile][field] = {};
      this.priorityMap[profile][field][key] = {};
    } else if (!this.priorityMap[profile][field][key]) {
      this.priorityMap[profile][field][key] = {};
    }
  }

  /**
   * Check if a behaviour is active.
   * @param {string} linkToBehaviour
   * @returns {boolean}
   */
  checkActive(linkToBehaviour) {
    // if there'S no link to a behaviour then it's automatically active
    if (!linkToBehaviour) return true;

    let activeBehaviours = []; // getActiveBehaviours();

    return activeBehaviours.indexOf(linkToBehaviour) !== -1;
  }
}

module.exports = new Validator();
