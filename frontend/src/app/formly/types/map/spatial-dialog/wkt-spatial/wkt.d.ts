declare var Wkt: WktModule.WktStatic;

declare namespace WktModule {
  interface WktStatic {
    delimiter: string;
    Wkt: Wkt;
    new (obj?: any): Wkt;
    beginsWith(str: string, sub: string): boolean;
    endsWith(str: string, sub: string): boolean;
    isArray(obj: any): boolean;
    trim(str: string, sub: string): string;
  }

  interface Wkt {
    delimiter: string;
    wrapVertices: string;
    regExes: string;
    components: string;
    extract: Extract;
    isRectangle: boolean;
    construct: Construct;
    new (): Wkt;
    isCollection(): boolean;
    sameCoords(a: any, b: any): boolean;
    fromObject(obj: any): Wkt;
    toObject(config?: any): any;
    toString(config?: any): string;
    fromJson(obj: any): Wkt;
    toJson(): any;
    merge(wkt: string): Wkt;
    read(str: string): Wkt;
    write(components?: Array<any>): string;
  }

  interface Extract {
    point(point: any): string;
    multipoint(multipoint: any): string;
    linestring(linestring: any): string;
    multilinestring(multilinestring: any): string;
    polygon(polygon: any): string;
    multipolygon(multipolygon: any): string;
    box(box: any): string;
  }

  interface Ingest {
    point(str: string): any;
    multipoint(str: string): any;
    linestring(str: string): any;
    multilinestring(str: string): any;
    polygon(str: string): any;
    multipolygon(str: string): any;
  }

  interface Construct {
    point(
      config: google.maps.MarkerOptions,
      component?: google.maps.Marker,
    ): google.maps.Marker;
    multipoint(config: google.maps.MarkerOptions): google.maps.Marker[];
    linestring(
      config: google.maps.PolylineOptions,
      component?: google.maps.Polyline,
    ): google.maps.Polyline;
    multilinestring(
      config: google.maps.PolylineOptions,
    ): google.maps.Polyline[];
    box(
      config: google.maps.RectangleOptions,
      component?: google.maps.Rectangle,
    ): google.maps.Rectangle;
    polygon(
      config: google.maps.PolygonOptions,
      component?: google.maps.Polygon,
    ): google.maps.Polygon;
    multipolygon(config: google.maps.PolygonOptions): google.maps.Polygon[];
    deconstruct(
      obj:
        | google.maps.Marker
        | google.maps.Polygon
        | google.maps.Polyline
        | google.maps.Rectangle
        | google.maps.Circle,
      multiFlag: boolean,
    ): any;
  }
}

declare namespace google {
  // @ts-ignore
  declare namespace maps {
    // tslint:disable-next-line:no-empty-interface
    interface Marker {}
    // tslint:disable-next-line:no-empty-interface
    interface MarkerOptions {}
    // tslint:disable-next-line:no-empty-interface
    interface Polyline {}
    // tslint:disable-next-line:no-empty-interface
    interface PolylineOptions {}
    // tslint:disable-next-line:no-empty-interface
    interface Rectangle {}
    // tslint:disable-next-line:no-empty-interface
    interface RectangleOptions {}
    // tslint:disable-next-line:no-empty-interface
    interface Polygon {}
    // tslint:disable-next-line:no-empty-interface
    interface PolygonOptions {}
    // tslint:disable-next-line:no-empty-interface
    interface Circle {}
  }
}
