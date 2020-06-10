declare var Wkt: WktModule.WktStatic;

declare namespace WktModule {
    interface WktStatic {
        new (obj?: any): Wkt;
        beginsWith(str: string, sub: string): boolean;
        endsWith(str: string, sub: string): boolean;
        delimiter: string;
        isArray(obj: any): boolean;
        trim(str: string, sub: string): string;
        Wkt: Wkt;
    }

    interface Wkt {
        new(): Wkt;
        delimiter: string;
        wrapVertices: string;
        regExes: string;
        components: string;
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
        extract: Extract;
        isRectangle: boolean;
        construct: Construct;
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
        point(config: google.maps.MarkerOptions, component?: google.maps.Marker ): google.maps.Marker;
        multipoint(config: google.maps.MarkerOptions): google.maps.Marker[];
        linestring(config: google.maps.PolylineOptions, component?: google.maps.Polyline): google.maps.Polyline;
        multilinestring(config: google.maps.PolylineOptions): google.maps.Polyline[];
        box(config: google.maps.RectangleOptions, component?: google.maps.Rectangle): google.maps.Rectangle;
        polygon(config: google.maps.PolygonOptions, component?: google.maps.Polygon): google.maps.Polygon;
        multipolygon(config: google.maps.PolygonOptions): google.maps.Polygon[];
        deconstruct(obj: google.maps.Marker | google.maps.Polygon | google.maps.Polyline | google.maps.Rectangle | google.maps.Circle, multiFlag: boolean): any;
    }
}
