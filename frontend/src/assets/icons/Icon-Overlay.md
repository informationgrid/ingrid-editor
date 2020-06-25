# Add new SVG

* clean up SVG here: https://jakearchibald.github.io/svgomg/
* add `class='coloring'` to foreground path element
* replace svg-tag with symbol-tag
* add symbol to svg-library-file
* change color by using css class `coloring` via fill- and stroke-attribute


# Overlays

This snippet shows how to overlay two material icons:

```css
.overme {
  position: absolute;
  right: 0;
  bottom: 0;
  color: red;
}

div.failed_icon {
  display: inline-block;
  position: relative;
}
```

--------
```html
<div class="failed_icon">
  <i class="material-icons large">mail</i>
  <i class="material-icons small overme">photo</i>
</div>
```
