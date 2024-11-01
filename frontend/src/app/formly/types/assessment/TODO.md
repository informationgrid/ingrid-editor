# TODO

This is a prototype version of an assessment display.

## Areas for Improvement

* Increase responsiveness while ensuring robustness:
  * Remove `debounceTime(100)`
  * Consequent null handling
* The scoring is heavily influenced by https://data.europa.eu/mqa/methodology?locale=en, which is tailored to DCAT-AP
  * Create a more appropriate, really CSW- or InGrid-specific scoring
  * Allow different scoring sub-categories to be turned on/off for different MD types
* Show detailed explanation when clicking on the assessment result
* Save assessment score in database
  * This enables creating a quality dashboard over all results in a catalog (cf. https://data.europa.eu/mqa/dimensions/score?locale=en)
  * Directly see which datasets do not conform to which quality sub-category
* Styling
