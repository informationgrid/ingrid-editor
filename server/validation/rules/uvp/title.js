
class UvpRequiredFields {


  constructor() {
    // the profile where this rule should apply
    this.profile = 'UVP';

    // the field to apply this rule to
    this.field = 'title';

    // the priority in case another rule for this profile and field occurs
    // this.priority = 0;

    // the linked behaviour name if this rule can be toggled
    // this.linkToBehaviour = 'xxx';

    //
    this.validate = {
      presence: true
    };
  }

}

module.exports = new UvpRequiredFields();
