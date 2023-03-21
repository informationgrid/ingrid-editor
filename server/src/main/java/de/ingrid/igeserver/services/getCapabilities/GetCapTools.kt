package de.ingrid.igeserver.services.getCapabilities

import org.geotools.referencing.CRS


enum class CoordType {
    COORDS_ETRS89_UTM31N, COORDS_ETRS89_UTM32N, COORDS_ETRS89_UTM33N, COORDS_ETRS89_UTM32N_NE, COORDS_ETRS89_UTM33N_NE, COORDS_ETRS89_UTM32N_ZE, COORDS_ETRS89_UTM33N_ZE, COORDS_ETRS89_UTM34N, COORDS_GK2, COORDS_GK3, COORDS_GK4, COORDS_GK5, COORDS_GK2_EN, COORDS_GK3_EN, COORDS_GK4_EN, COORDS_GK5_EN, COORDS_ETRS89_LCC, COORDS_ETRS89_LCC_DE, COORDS_ETRS89_LAEA, COORDS_CRS84, COORDS_WGS84_PM, COORDS_WGS84
}

private const val COORDS_WKT_GK2 =
    "PROJCS[\"DHDN / Gauss-Kruger zone 2\",GEOGCS[\"DHDN\",DATUM[\"Deutsches Hauptdreiecksnetz\", SPHEROID[\"Bessel 1841\", 6377397.155, 299.1528128, AUTHORITY[\"EPSG\",\"7004\"]], TOWGS84[612.4, 77.0, 440.2, -0.054, 0.057, -2.797, 0.5259752559300956], AUTHORITY[\"EPSG\",\"6314\"]], PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\", 0.017453292519943295], AXIS[\"Geodetic longitude\", EAST], AXIS[\"Geodetic latitude\", NORTH],    AUTHORITY[\"EPSG\",\"4314\"]],  PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],  PARAMETER[\"central_meridian\", 6.0],  PARAMETER[\"latitude_of_origin\", 0.0],  PARAMETER[\"scale_factor\", 1.0],  PARAMETER[\"false_easting\", 2500000.0],  PARAMETER[\"false_northing\", 0.0],  UNIT[\"m\", 1.0],  AXIS[\"Easting\", EAST],  AXIS[\"Northing\", NORTH],  AUTHORITY[\"EPSG\",\"31466\"]]"
private const val COORDS_WKT_GK3 =
    "PROJCS[\"DHDN / Gauss-Kruger zone 3\",GEOGCS[\"DHDN\",DATUM[\"Deutsches Hauptdreiecksnetz\", SPHEROID[\"Bessel 1841\", 6377397.155, 299.1528128, AUTHORITY[\"EPSG\",\"7004\"]], TOWGS84[612.4, 77.0, 440.2, -0.054, 0.057, -2.797, 0.5259752559300956], AUTHORITY[\"EPSG\",\"6314\"]],    PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],    UNIT[\"degree\", 0.017453292519943295],    AXIS[\"Geodetic longitude\", EAST],    AXIS[\"Geodetic latitude\", NORTH],    AUTHORITY[\"EPSG\",\"4314\"]],  PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],  PARAMETER[\"central_meridian\", 9.0],  PARAMETER[\"latitude_of_origin\", 0.0],  PARAMETER[\"scale_factor\", 1.0],  PARAMETER[\"false_easting\", 3500000.0],  PARAMETER[\"false_northing\", 0.0],  UNIT[\"m\", 1.0],  AXIS[\"Easting\", EAST],  AXIS[\"Northing\", NORTH],  AUTHORITY[\"EPSG\",\"31467\"]]"
private const val COORDS_WKT_GK4 =
    "PROJCS[\"DHDN / Gauss-Kruger zone 4\",GEOGCS[\"DHDN\",DATUM[\"Deutsches Hauptdreiecksnetz\", SPHEROID[\"Bessel 1841\", 6377397.155, 299.1528128, AUTHORITY[\"EPSG\",\"7004\"]], TOWGS84[612.4, 77.0, 440.2, -0.054, 0.057, -2.797, 0.5259752559300956], AUTHORITY[\"EPSG\",\"6314\"]],    PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],    UNIT[\"degree\", 0.017453292519943295],    AXIS[\"Geodetic longitude\", EAST],    AXIS[\"Geodetic latitude\", NORTH],    AUTHORITY[\"EPSG\",\"4314\"]],  PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],  PARAMETER[\"central_meridian\", 12.0],  PARAMETER[\"latitude_of_origin\", 0.0],  PARAMETER[\"scale_factor\", 1.0],  PARAMETER[\"false_easting\", 4500000.0],  PARAMETER[\"false_northing\", 0.0],  UNIT[\"m\", 1.0],  AXIS[\"Easting\", EAST],  AXIS[\"Northing\", NORTH],  AUTHORITY[\"EPSG\",\"31468\"]]"
private const val COORDS_WKT_GK5 =
    "PROJCS[\"DHDN / Gauss-Kruger zone 5\",GEOGCS[\"DHDN\",DATUM[\"Deutsches Hauptdreiecksnetz\", SPHEROID[\"Bessel 1841\", 6377397.155, 299.1528128, AUTHORITY[\"EPSG\",\"7004\"]], TOWGS84[612.4, 77.0, 440.2, -0.054, 0.057, -2.797, 0.5259752559300956], AUTHORITY[\"EPSG\",\"6314\"]],    PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],    UNIT[\"degree\", 0.017453292519943295],    AXIS[\"Geodetic longitude\", EAST],    AXIS[\"Geodetic latitude\", NORTH],    AUTHORITY[\"EPSG\",\"4314\"]],  PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],  PARAMETER[\"central_meridian\", 15.0],  PARAMETER[\"latitude_of_origin\", 0.0],  PARAMETER[\"scale_factor\", 1.0],  PARAMETER[\"false_easting\", 5500000.0],  PARAMETER[\"false_northing\", 0.0],  UNIT[\"m\", 1.0],  AXIS[\"Easting\", EAST],  AXIS[\"Northing\", NORTH],  AUTHORITY[\"EPSG\",\"31469\"]]"
private const val COORDS_WKT_GK2_EN =
    "PROJCS[\"DHDN / 3-degree Gauss-Kruger zone 2 (E-N)\",GEOGCS[\"DHDN\",DATUM[\"Deutsches_Hauptdreiecksnetz\",SPHEROID[\"Bessel 1841\",6377397.155,299.1528128,AUTHORITY[\"EPSG\",\"7004\"]],TOWGS84[598.1,73.7,418.2,0.202,0.045,-2.455,6.7],AUTHORITY[\"EPSG\",\"6314\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4314\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",6],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",2500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"5676\"]]"
private const val COORDS_WKT_GK3_EN =
    "PROJCS[\"DHDN / 3-degree Gauss-Kruger zone 3 (E-N)\",GEOGCS[\"DHDN\",DATUM[\"Deutsches_Hauptdreiecksnetz\",SPHEROID[\"Bessel 1841\",6377397.155,299.1528128,AUTHORITY[\"EPSG\",\"7004\"]],TOWGS84[598.1,73.7,418.2,0.202,0.045,-2.455,6.7],AUTHORITY[\"EPSG\",\"6314\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4314\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",9],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",3500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"5677\"]]"
private const val COORDS_WKT_GK4_EN =
    "PROJCS[\"DHDN / 3-degree Gauss-Kruger zone 4 (E-N)\",GEOGCS[\"DHDN\",DATUM[\"Deutsches_Hauptdreiecksnetz\",SPHEROID[\"Bessel 1841\",6377397.155,299.1528128,AUTHORITY[\"EPSG\",\"7004\"]],TOWGS84[598.1,73.7,418.2,0.202,0.045,-2.455,6.7],AUTHORITY[\"EPSG\",\"6314\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4314\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",12],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",4500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"5678\"]]"
private const val COORDS_WKT_GK5_EN =
    "PROJCS[\"DHDN / 3-degree Gauss-Kruger zone 5 (E-N)\",GEOGCS[\"DHDN\",DATUM[\"Deutsches_Hauptdreiecksnetz\",SPHEROID[\"Bessel 1841\",6377397.155,299.1528128,AUTHORITY[\"EPSG\",\"7004\"]],TOWGS84[598.1,73.7,418.2,0.202,0.045,-2.455,6.7],AUTHORITY[\"EPSG\",\"6314\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4314\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",15],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",5500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"5679\"]]"
private const val COORDS_WKT_ETRS89_UTM31N =
    "PROJCS[\"ETRS89 / UTM zone 31N\",GEOGCS[\"ETRS89\",DATUM[\"European Terrestrial Reference System 1989\",SPHEROID[\"GRS 1980\", 6378137.0, 298.257222101, AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\", 0.017453292519943295],AXIS[\"Geodetic longitude\", EAST],AXIS[\"Geodetic latitude\", NORTH],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],PARAMETER[\"central_meridian\", 3.0], PARAMETER[\"latitude_of_origin\", 0.0], PARAMETER[\"scale_factor\", 0.9996], PARAMETER[\"false_easting\", 500000.0],PARAMETER[\"false_northing\", 0.0],UNIT[\"m\", 1.0],AXIS[\"Easting\", EAST],AXIS[\"Northing\", NORTH],AUTHORITY[\"EPSG\",\"25831\"]]"
private const val COORDS_WKT_ETRS89_UTM32N =
    "PROJCS[\"ETRS89 / UTM zone 32N\",GEOGCS[\"ETRS89\",DATUM[\"European Terrestrial Reference System 1989\",SPHEROID[\"GRS 1980\", 6378137.0, 298.257222101, AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\", 0.017453292519943295],AXIS[\"Geodetic longitude\", EAST],AXIS[\"Geodetic latitude\", NORTH],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],PARAMETER[\"central_meridian\", 9.0], PARAMETER[\"latitude_of_origin\", 0.0], PARAMETER[\"scale_factor\", 0.9996], PARAMETER[\"false_easting\", 500000.0],PARAMETER[\"false_northing\", 0.0],UNIT[\"m\", 1.0],AXIS[\"Easting\", EAST],AXIS[\"Northing\", NORTH],AUTHORITY[\"EPSG\",\"25832\"]]"
private const val COORDS_WKT_ETRS89_UTM33N =
    "PROJCS[\"ETRS89 / UTM zone 33N\",GEOGCS[\"ETRS89\",DATUM[\"European Terrestrial Reference System 1989\",SPHEROID[\"GRS 1980\", 6378137.0, 298.257222101, AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\", 0.017453292519943295],AXIS[\"Geodetic longitude\", EAST],AXIS[\"Geodetic latitude\", NORTH],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],PARAMETER[\"central_meridian\", 15.0],PARAMETER[\"latitude_of_origin\", 0.0], PARAMETER[\"scale_factor\", 0.9996], PARAMETER[\"false_easting\", 500000.0],PARAMETER[\"false_northing\", 0.0],UNIT[\"m\", 1.0],AXIS[\"Easting\", EAST],AXIS[\"Northing\", NORTH],AUTHORITY[\"EPSG\",\"25833\"]]"
private const val COORDS_WKT_ETRS89_UTM32N_NE =
    "PROJCS[\"ETRS89 / UTM zone 32N (N-E)\", GEOGCS[\"ETRS89\", DATUM[\"European_Terrestrial_Reference_System_1989\", SPHEROID[\"GRS 1980\",6378137,298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY[\"EPSG\",\"6258\"]], PRIMEM[\"Greenwich\",0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\",0.0174532925199433, AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"4258\"]], PROJECTION[\"Transverse_Mercator\"], PARAMETER[\"latitude_of_origin\",0], PARAMETER[\"central_meridian\",9], PARAMETER[\"scale_factor\",0.9996], PARAMETER[\"false_easting\",500000], PARAMETER[\"false_northing\",0], UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]], AUTHORITY[\"EPSG\",\"3044\"]]"
private const val COORDS_WKT_ETRS89_UTM33N_NE =
    "PROJCS[\"ETRS89 / UTM zone 33N (N-E)\", GEOGCS[\"ETRS89\", DATUM[\"European_Terrestrial_Reference_System_1989\", SPHEROID[\"GRS 1980\",6378137,298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY[\"EPSG\",\"6258\"]], PRIMEM[\"Greenwich\",0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\",0.0174532925199433, AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"4258\"]], PROJECTION[\"Transverse_Mercator\"], PARAMETER[\"latitude_of_origin\",0], PARAMETER[\"central_meridian\",15], PARAMETER[\"scale_factor\",0.9996], PARAMETER[\"false_easting\",500000], PARAMETER[\"false_northing\",0], UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]], AUTHORITY[\"EPSG\",\"3045\"]]"
private const val COORDS_WKT_ETRS89_UTM32N_ZE =
    "PROJCS[\"ETRS89 / UTM zone 32N (zE-N)\",GEOGCS[\"ETRS89\",DATUM[\"European_Terrestrial_Reference_System_1989\",SPHEROID[\"GRS 1980\",6378137,298.257222101,AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",9],PARAMETER[\"scale_factor\",0.9996],PARAMETER[\"false_easting\",32500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"4647\"]]"
private const val COORDS_WKT_ETRS89_UTM33N_ZE =
    "PROJCS[\"ETRS89 / UTM zone 33N (zE-N)\",GEOGCS[\"ETRS89\",DATUM[\"European_Terrestrial_Reference_System_1989\",SPHEROID[\"GRS 1980\",6378137,298.257222101,AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",15],PARAMETER[\"scale_factor\",0.9996],PARAMETER[\"false_easting\",33500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"5650\"]]"
private const val COORDS_WKT_ETRS89_UTM34N =
    "PROJCS[\"ETRS89 / UTM zone 34N\",GEOGCS[\"ETRS89\",DATUM[\"European Terrestrial Reference System 1989\",SPHEROID[\"GRS 1980\", 6378137.0, 298.257222101, AUTHORITY[\"EPSG\",\"7019\"]],TOWGS84[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],AUTHORITY[\"EPSG\",\"6258\"]],PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\", 0.017453292519943295],AXIS[\"Geodetic longitude\", EAST],AXIS[\"Geodetic latitude\", NORTH],AUTHORITY[\"EPSG\",\"4258\"]],PROJECTION[\"Transverse Mercator\", AUTHORITY[\"EPSG\",\"9807\"]],PARAMETER[\"central_meridian\", 21.0],PARAMETER[\"latitude_of_origin\", 0.0], PARAMETER[\"scale_factor\", 0.9996], PARAMETER[\"false_easting\", 500000.0],PARAMETER[\"false_northing\", 0.0],UNIT[\"m\", 1.0],AXIS[\"Easting\", EAST],AXIS[\"Northing\", NORTH],AUTHORITY[\"EPSG\",\"25834\"]]"
private const val COORDS_WKT_ETRS89_LCC =
    "PROJCS[\"ETRS89 / LCC Europe\", GEOGCS[\"ETRS89\", DATUM[\"European_Terrestrial_Reference_System_1989\", SPHEROID[\"GRS 1980\",6378137,298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY[\"EPSG\",\"6258\"]], PRIMEM[\"Greenwich\",0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\",0.0174532925199433, AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"4258\"]], PROJECTION[\"Lambert_Conformal_Conic_2SP\"], PARAMETER[\"standard_parallel_1\",35], PARAMETER[\"standard_parallel_2\",65], PARAMETER[\"latitude_of_origin\",52], PARAMETER[\"central_meridian\",10], PARAMETER[\"false_easting\",4000000], PARAMETER[\"false_northing\",2800000], UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]], AUTHORITY[\"EPSG\",\"3034\"]]"
private const val COORDS_WKT_ETRS89_LCC_DE =
    "PROJCS[\"ETRS89 / LCC Germany (N-E)\", GEOGCS[\"ETRS89\", DATUM[\"European_Terrestrial_Reference_System_1989\", SPHEROID[\"GRS 1980\",6378137,298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY[\"EPSG\",\"6258\"]], PRIMEM[\"Greenwich\",0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\",0.0174532925199433, AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"4258\"]], PROJECTION[\"Lambert_Conformal_Conic_2SP\"], PARAMETER[\"standard_parallel_1\",48.66666666666666], PARAMETER[\"standard_parallel_2\",53.66666666666666], PARAMETER[\"latitude_of_origin\",51], PARAMETER[\"central_meridian\",10.5], PARAMETER[\"false_easting\",0], PARAMETER[\"false_northing\",0], UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]], AUTHORITY[\"EPSG\",\"4839\"]]"
private const val COORDS_WKT_ETRS89_LAEA =
    "PROJCS[\"ETRS89 / LAEA Europe\", GEOGCS[\"ETRS89\", DATUM[\"European_Terrestrial_Reference_System_1989\", SPHEROID[\"GRS 1980\",6378137,298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY[\"EPSG\",\"6258\"]], PRIMEM[\"Greenwich\",0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\",0.0174532925199433, AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"4258\"]], PROJECTION[\"Lambert_Azimuthal_Equal_Area\"], PARAMETER[\"latitude_of_center\",52], PARAMETER[\"longitude_of_center\",10], PARAMETER[\"false_easting\",4321000], PARAMETER[\"false_northing\",3210000], UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]], AUTHORITY[\"EPSG\",\"3035\"]]"
private const val COORDS_WKT_CRS84 =
    "GEOGCS[\"WGS 84\", DATUM[\"World Geodetic System 1984\",SPHEROID[\"WGS 84\", 6378137.0, 298.257223563, AUTHORITY[\"EPSG\",\"7030\"]], AUTHORITY[\"EPSG\",\"6326\"]],  PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\", 0.017453292519943295], AXIS[\"Geodetic longitude\", NORTH], AXIS[\"Geodetic latitude\", EAST],AUTHORITY[\"EPSG\",\"4326\"]]"

// WGS 84 Pseudo Mercator as in: https://trac.osgeo.org/gdal/ticket/3962#comment:4
private const val COORDS_WKT_WGS84_PM =
    "PROJCS[\"Google Mercator\", GEOGCS[\"WGS 84\", DATUM[\"World Geodetic System 1984\", SPHEROID[\"WGS 84\", 6378137, 298.257223563]], PRIMEM[\"Greenwich\", 0], UNIT[\"degree\", 0.017453292519943295]], PROJECTION[\"Mercator (1SP)\"], PARAMETER[\"semi_major\", 6378137], PARAMETER[\"semi_minor\", 6378137], UNIT[\"m\", 1]]"
private const val COORDS_WKT_WGS84 =
    "GEOGCS[\"WGS 84\", DATUM[\"World Geodetic System 1984\",SPHEROID[\"WGS 84\", 6378137.0, 298.257223563, AUTHORITY[\"EPSG\",\"7030\"]], AUTHORITY[\"EPSG\",\"6326\"]],  PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\", 0.017453292519943295], AXIS[\"Geodetic longitude\", EAST], AXIS[\"Geodetic latitude\", NORTH],AUTHORITY[\"EPSG\",\"4326\"]]"

private const val COORDS_EPSG_GK2 = "31466"
private const val COORDS_EPSG_GK3 = "31467"
private const val COORDS_EPSG_GK4 = "31468"
private const val COORDS_EPSG_GK5 = "31469"
private const val COORDS_EPSG_GK2_EN = "5676"
private const val COORDS_EPSG_GK3_EN = "5677"
private const val COORDS_EPSG_GK4_EN = "5678"
private const val COORDS_EPSG_GK5_EN = "5679"
private const val COORDS_EPSG_ETRS89_UTM31N = "25831"
private const val COORDS_EPSG_ETRS89_UTM32N = "25832"
private const val COORDS_EPSG_ETRS89_UTM33N = "25833"
private const val COORDS_EPSG_ETRS89_UTM32N_NE = "3044"
private const val COORDS_EPSG_ETRS89_UTM33N_NE = "3045"
private const val COORDS_EPSG_ETRS89_UTM32N_ZE = "4647"
private const val COORDS_EPSG_ETRS89_UTM33N_ZE = "5650"
private const val COORDS_EPSG_ETRS89_UTM34N = "25834"
private const val COORDS_EPSG_ETRS89_LCC = "3034"
private const val COORDS_EPSG_ETRS89_LCC_DE = "4839"
private const val COORDS_EPSG_ETRS89_LAEA = "3035"
private const val COORDS_EPSG_CRS84 = "84"
private const val COORDS_EPSG_WGS84_PM = "3857"
private const val COORDS_EPSG_WGS84 = "4326"

private const val COORDS_SYSTEM_GK2 = "Gauss-Kr&uuml;ger Zone 2"
private const val COORDS_SYSTEM_GK3 = "Gauss-Kr&uuml;ger Zone 3"
private const val COORDS_SYSTEM_GK4 = "Gauss-Kr&uuml;ger Zone 4"
private const val COORDS_SYSTEM_GK5 = "Gauss-Kr&uuml;ger Zone 5"
private const val COORDS_SYSTEM_GK2_EN = "Gauss-Kr&uuml;ger Zone 2 (E-N)"
private const val COORDS_SYSTEM_GK3_EN = "Gauss-Kr&uuml;ger Zone 3 (E-N)"
private const val COORDS_SYSTEM_GK4_EN = "Gauss-Kr&uuml;ger Zone 4 (E-N)"
private const val COORDS_SYSTEM_GK5_EN = "Gauss-Kr&uuml;ger Zone 5 (E-N)"
private const val COORDS_SYSTEM_ETRS89_UTM31N = "UTM Zone 31N"
private const val COORDS_SYSTEM_ETRS89_UTM32N = "UTM Zone 32N"
private const val COORDS_SYSTEM_ETRS89_UTM33N = "UTM Zone 33N"
private const val COORDS_SYSTEM_ETRS89_UTM32N_NE = "UTM Zone 32N (N-E)"
private const val COORDS_SYSTEM_ETRS89_UTM33N_NE = "UTM Zone 33N (N-E)"
private const val COORDS_SYSTEM_ETRS89_UTM32N_ZE = "UTM Zone 32N (zE-N)"
private const val COORDS_SYSTEM_ETRS89_UTM33N_ZE = "UTM Zone 33N (zE-N)"
private const val COORDS_SYSTEM_ETRS89_UTM34N = "UTM Zone 34N"
private const val COORDS_SYSTEM_ETRS89_LCC = "LCC Europa"
private const val COORDS_SYSTEM_ETRS89_LCC_DE = "LCC Deutschland (N-E)"
private const val COORDS_SYSTEM_ETRS89_LAEA = "LAEA Europa"
private const val COORDS_SYSTEM_CRS84 = "CRS 84"
private const val COORDS_SYSTEM_WGS84_PM = "WGS 84 Pseudo-Mercator"
private const val COORDS_SYSTEM_WGS84 = "WGS 84"


fun getUnionOfBoundingBoxes(boundingBoxesFromLayers: List<LocationBean>): LocationBean {
    val unionLocation = LocationBean()
    unionLocation.type = "frei"
    for (location in boundingBoxesFromLayers) {
        if (unionLocation.latitude1 == null) {
            if (location.latitude1 == null) continue
            unionLocation.latitude1 = location.latitude1
        }
        if (unionLocation.latitude1!! > location.latitude1!!) unionLocation.latitude1 = location.latitude1
        if (unionLocation.longitude1 == null) unionLocation.longitude1 = location.longitude1
        if (unionLocation.longitude1!! > location.longitude1!!) unionLocation.longitude1 = location.longitude1
        if (unionLocation.latitude2 == null) unionLocation.latitude2 = location.latitude2
        if (unionLocation.latitude2!! < location.latitude2!!) unionLocation.latitude2 = location.latitude2
        if (unionLocation.longitude2 == null) unionLocation.longitude2 = location.longitude2
        if (unionLocation.longitude2!! < location.longitude2!!) unionLocation.longitude2 = location.longitude2
    }
    return unionLocation
}

/**
 * Get CoordType by EPSG Code
 *
 * @param epsgCode
 * @return CoordType
 */
fun getCoordTypeByEPSGCode(epsgCode: String): CoordType? {
    return when (epsgCode) {
        COORDS_EPSG_WGS84 -> CoordType.COORDS_WGS84
        COORDS_EPSG_CRS84 -> CoordType.COORDS_CRS84
        COORDS_EPSG_WGS84_PM -> CoordType.COORDS_WGS84_PM
        COORDS_EPSG_ETRS89_UTM31N -> CoordType.COORDS_ETRS89_UTM31N
        COORDS_EPSG_ETRS89_UTM32N -> CoordType.COORDS_ETRS89_UTM32N
        COORDS_EPSG_ETRS89_UTM33N -> CoordType.COORDS_ETRS89_UTM33N
        COORDS_EPSG_ETRS89_UTM32N_ZE -> CoordType.COORDS_ETRS89_UTM32N_ZE
        COORDS_EPSG_ETRS89_UTM33N_ZE -> CoordType.COORDS_ETRS89_UTM33N_ZE
        COORDS_EPSG_ETRS89_UTM32N_NE -> CoordType.COORDS_ETRS89_UTM32N_NE
        COORDS_EPSG_ETRS89_UTM33N_NE -> CoordType.COORDS_ETRS89_UTM33N_NE
        COORDS_EPSG_ETRS89_UTM34N -> CoordType.COORDS_ETRS89_UTM34N
        COORDS_EPSG_ETRS89_LCC -> CoordType.COORDS_ETRS89_LCC
        COORDS_EPSG_ETRS89_LCC_DE -> CoordType.COORDS_ETRS89_LCC_DE
        COORDS_EPSG_ETRS89_LAEA -> CoordType.COORDS_ETRS89_LAEA
        COORDS_EPSG_GK2 -> CoordType.COORDS_GK2
        COORDS_EPSG_GK3 -> CoordType.COORDS_GK3
        COORDS_EPSG_GK4 -> CoordType.COORDS_GK4
        COORDS_EPSG_GK5 -> CoordType.COORDS_GK5
        COORDS_EPSG_GK2_EN -> CoordType.COORDS_GK2_EN
        COORDS_EPSG_GK3_EN -> CoordType.COORDS_GK3_EN
        COORDS_EPSG_GK4_EN -> CoordType.COORDS_GK4_EN
        COORDS_EPSG_GK5_EN -> CoordType.COORDS_GK5_EN
        else -> null
    }
}

fun transformToWGS84(coordsX: Double, coordsY: Double, coordsType: CoordType): DoubleArray {
    return transform(coordsX, coordsY, coordsType, CoordType.COORDS_WGS84)
}

fun transform(coordsX: Double, coordsY: Double, inCoordType: CoordType, outCoordType: CoordType): DoubleArray {
    val src = doubleArrayOf(coordsX, coordsY)
    val dst = DoubleArray(2)
    val inCRS = CRS.parseWKT(getWKTString(inCoordType))
    val outCRS = CRS.parseWKT(getWKTString(outCoordType))
    val tf = CRS.findMathTransform(inCRS, outCRS)
    tf.transform(src, 0, dst, 0, 1)
    return dst
}

fun getWKTString(coordsType: CoordType): String {
    val stringCoordsType: String = when (coordsType) {
        CoordType.COORDS_ETRS89_UTM31N -> COORDS_WKT_ETRS89_UTM31N
        CoordType.COORDS_ETRS89_UTM32N -> COORDS_WKT_ETRS89_UTM32N
        CoordType.COORDS_ETRS89_UTM33N -> COORDS_WKT_ETRS89_UTM33N
        CoordType.COORDS_ETRS89_UTM32N_ZE -> COORDS_WKT_ETRS89_UTM32N_ZE
        CoordType.COORDS_ETRS89_UTM33N_ZE -> COORDS_WKT_ETRS89_UTM33N_ZE
        CoordType.COORDS_ETRS89_UTM32N_NE -> COORDS_WKT_ETRS89_UTM32N_NE
        CoordType.COORDS_ETRS89_UTM33N_NE -> COORDS_WKT_ETRS89_UTM33N_NE
        CoordType.COORDS_ETRS89_UTM34N -> COORDS_WKT_ETRS89_UTM34N
        CoordType.COORDS_ETRS89_LCC -> COORDS_WKT_ETRS89_LCC
        CoordType.COORDS_ETRS89_LCC_DE -> COORDS_WKT_ETRS89_LCC_DE
        CoordType.COORDS_ETRS89_LAEA -> COORDS_WKT_ETRS89_LAEA
        CoordType.COORDS_GK2 -> COORDS_WKT_GK2
        CoordType.COORDS_GK3 -> COORDS_WKT_GK3
        CoordType.COORDS_GK4 -> COORDS_WKT_GK4
        CoordType.COORDS_GK5 -> COORDS_WKT_GK5
        CoordType.COORDS_GK2_EN -> COORDS_WKT_GK2_EN
        CoordType.COORDS_GK3_EN -> COORDS_WKT_GK3_EN
        CoordType.COORDS_GK4_EN -> COORDS_WKT_GK4_EN
        CoordType.COORDS_GK5_EN -> COORDS_WKT_GK5_EN
        CoordType.COORDS_CRS84 -> COORDS_WKT_CRS84
        CoordType.COORDS_WGS84_PM -> COORDS_WKT_WGS84_PM
        else -> COORDS_WKT_WGS84
    }
    return stringCoordsType
}