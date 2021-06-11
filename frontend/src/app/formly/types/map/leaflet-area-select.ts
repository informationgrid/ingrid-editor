import { DomEvent, DomUtil, Evented, LatLngBounds, Point, Util } from "leaflet";

export class LeafletAreaSelect extends Evented {
  _width;
  _height;
  map;

  _container;
  _topShade;
  _bottomShade;
  _leftShade;
  _rightShade;

  _nwHandle;
  _swHandle;
  _neHandle;
  _seHandle;

  options = {
    width: 200,
    height: 300,
    keepAspectRatio: false,
  };

  constructor(options) {
    super();
    this.initialize(options);
  }

  initialize(options) {
    Util.setOptions(this, options);

    this._width = this.options.width;
    this._height = this.options.height;
  }

  addTo(map) {
    this.map = map;
    this._createElements();
    this._render();
    return this;
  }

  getBounds() {
    const size = this.map.getSize();
    const topRight = new Point(0, 0);
    const bottomLeft = new Point(0, 0);

    bottomLeft.x = Math.round((size.x - this._width) / 2);
    topRight.y = Math.round((size.y - this._height) / 2);
    topRight.x = size.x - bottomLeft.x;
    bottomLeft.y = size.y - topRight.y;

    const sw = this.map.containerPointToLatLng(bottomLeft);
    const ne = this.map.containerPointToLatLng(topRight);

    return new LatLngBounds(sw, ne);
  }

  remove() {
    this.map.off("moveend", this._onMapChange);
    this.map.off("zoomend", this._onMapChange);
    this.map.off("resize", this._onMapResize);

    this._container.parentNode.removeChild(this._container);
  }

  setDimensions(dimensions) {
    if (!dimensions) {
      return;
    }

    this._height = parseInt(dimensions.height, 10) || this._height;
    this._width = parseInt(dimensions.width, 10) || this._width;
    this._render();
    this.fire("change");
  }

  _createElements() {
    if (!!this._container) {
      return;
    }

    this._container = DomUtil.create(
      "div",
      "leaflet-areaselect-container",
      this.map._controlContainer
    );
    this._topShade = DomUtil.create(
      "div",
      "leaflet-areaselect-shade leaflet-control",
      this._container
    );
    this._bottomShade = DomUtil.create(
      "div",
      "leaflet-areaselect-shade leaflet-control",
      this._container
    );
    this._leftShade = DomUtil.create(
      "div",
      "leaflet-areaselect-shade leaflet-control",
      this._container
    );
    this._rightShade = DomUtil.create(
      "div",
      "leaflet-areaselect-shade leaflet-control",
      this._container
    );

    this._nwHandle = DomUtil.create(
      "div",
      "leaflet-areaselect-handle leaflet-control",
      this._container
    );
    this._swHandle = DomUtil.create(
      "div",
      "leaflet-areaselect-handle leaflet-control",
      this._container
    );
    this._neHandle = DomUtil.create(
      "div",
      "leaflet-areaselect-handle leaflet-control",
      this._container
    );
    this._seHandle = DomUtil.create(
      "div",
      "leaflet-areaselect-handle leaflet-control",
      this._container
    );

    this._setUpHandlerEvents(this._nwHandle, null, null);
    this._setUpHandlerEvents(this._neHandle, -1, 1);
    this._setUpHandlerEvents(this._swHandle, 1, -1);
    this._setUpHandlerEvents(this._seHandle, -1, -1);

    this.map.on("moveend", this._onMapChange, this);
    this.map.on("zoomend", this._onMapChange, this);
    this.map.on("resize", this._onMapResize, this);

    this.fire("change");
  }

  _setUpHandlerEvents(handle, xMod, yMod) {
    xMod = xMod || 1;
    yMod = yMod || 1;

    const self = this;

    function onMouseDown(event) {
      event.stopPropagation();
      self.map.dragging.disable();
      DomEvent.removeListener(this, "mousedown", onMouseDown);
      let curX = event.pageX;
      let curY = event.pageY;
      const ratio = self._width / self._height;
      const size = self.map.getSize();

      function onMouseMove(event2) {
        if (self.options.keepAspectRatio) {
          const maxHeight =
            (self._height >= self._width ? size.y : size.y * (1 / ratio)) - 30;
          self._height += (curY - event2.originalEvent.pageY) * 2 * yMod;
          self._height = Math.max(30, self._height);
          self._height = Math.min(maxHeight, self._height);
          self._width = self._height * ratio;
        } else {
          self._width += (curX - event2.originalEvent.pageX) * 2 * xMod;
          self._height += (curY - event2.originalEvent.pageY) * 2 * yMod;
          self._width = Math.max(30, self._width);
          self._height = Math.max(30, self._height);
          self._width = Math.min(size.x - 30, self._width);
          self._height = Math.min(size.y - 30, self._height);
        }

        curX = event2.originalEvent.pageX;
        curY = event2.originalEvent.pageY;
        self._render();
      }

      function onMouseUp(event3) {
        self.map.dragging.enable();
        DomEvent.removeListener(self.map, "mouseup", onMouseUp);
        DomEvent.removeListener(self.map, "mousemove", onMouseMove);
        DomEvent.addListener(handle, "mousedown", onMouseDown);
        self.fire("change");
      }

      DomEvent.addListener(self.map, "mousemove", onMouseMove);
      DomEvent.addListener(self.map, "mouseup", onMouseUp);
    }

    DomEvent.addListener(handle, "mousedown", onMouseDown);
  }

  _onMapResize() {
    this._render();
  }

  _onMapChange() {
    this.fire("change");
  }

  _render() {
    const size = this.map.getSize();
    const handleOffset = Math.round(this._nwHandle.offsetWidth / 2);

    const topBottomHeight = Math.round((size.y - this._height) / 2);
    const leftRightWidth = Math.round((size.x - this._width) / 2);

    function setDimensions(element, dimension) {
      element.style.width = dimension.width + "px";
      element.style.height = dimension.height + "px";
      element.style.top = dimension.top + "px";
      element.style.left = dimension.left + "px";
      element.style.bottom = dimension.bottom + "px";
      element.style.right = dimension.right + "px";
    }

    setDimensions(this._topShade, {
      width: size.x,
      height: topBottomHeight,
      top: 0,
      left: 0,
    });
    setDimensions(this._bottomShade, {
      width: size.x,
      height: topBottomHeight,
      bottom: 0,
      left: 0,
    });
    setDimensions(this._leftShade, {
      width: leftRightWidth,
      height: size.y - topBottomHeight * 2,
      top: topBottomHeight,
      left: 0,
    });
    setDimensions(this._rightShade, {
      width: leftRightWidth,
      height: size.y - topBottomHeight * 2,
      top: topBottomHeight,
      right: 0,
    });

    setDimensions(this._nwHandle, {
      left: leftRightWidth - handleOffset,
      top: topBottomHeight - 7,
    });
    setDimensions(this._neHandle, {
      right: leftRightWidth - handleOffset,
      top: topBottomHeight - 7,
    });
    setDimensions(this._swHandle, {
      left: leftRightWidth - handleOffset,
      bottom: topBottomHeight - 7,
    });
    setDimensions(this._seHandle, {
      right: leftRightWidth - handleOffset,
      bottom: topBottomHeight - 7,
    });
  }
}
