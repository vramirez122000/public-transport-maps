__author__ = 'victor'

colors_by_route = {
    'TU': '4d8327',
    'E10': '583c64',
    'E20': '5268b5',
    'E40': '6598dd',
    'T2': '43aad6',
    'T3': 'bf6a4b',
    'T4': 'e3591b',
    'T5': 'e561de',
    'T6': '225226',
    'T7': '792f4d',
    'T8': 'd1cd2b',
    'T9': '8c6712',
    'T21': '9a5bbb',
    'T41': '454909',
    'C1': '8067a5',
    'C22': 'df6fa9',
    'C35': '41df90',
    'C36': '5a82e8',
    'C43': '8cd92f',
    'C44': 'b69924',
    'C51': 'dd527e',
    'D13': '4ee13b',
    'D15': 'e3338d',
    'D18': 'ea9329',
    'D26': '2d5e86',
    'D27': '6d771d',
    'D37': 'af8edd',
    'D45': 'bf6e29',
    'D53': 'c84aa5',
    'D91': '8b2363',
    'D92': '783c18',
    'AX1': 'a13e20',
}

route_desc = {
    'AX1': 'AX1: Acuaexpreso Cataño',
    'TU': 'TU: Tren Urbano',
    'T2': 'T2: Bayamón -> Sagrado',
    'T3': 'T3: Sagrado -> San Juan',
    'T4': 'T4: Martínez Nadal -> Cataño',
    'T5': 'T5: Iturregui -> San Juan',
    'T6': 'T6: Iturregui -> Carolina',
    'T7': 'T7: Carolina -> TU Cupey',
    'T8': 'T8: Martínez Nadal -> Piñero',
    'T9': 'T9: Río Piedras -> San Juan',
    'T21': 'T21: Condado',
    'T41': 'T41: Iturregui -> TU Piñero',
    'E10': 'E10: Sagrado -> San Juan',
    'E20': 'E20: TU Bayamón -> Toa Baja',
    'E40': 'E40: Piñero -> Aeropuerto',
    'C1': 'C1: Sagrado -> Río Piedras',
    'C22': 'C22: Sagrado -> Plaza',
    'C35': 'C35: Sagrado -> Convenciones',
    'C36': 'C36: Sagrado -> Llorens',
    'C43': 'C43: Iturregui -> Vista Mar',
    'C44': 'C44: Carolina -> Villa Carolina',
    'C51': 'C51: Carolina -> Escorial',
    'D13': 'D13: TU Cupey -> Interamericana',
    'D15': 'D15: TU Cupey -> Sagrado',
    'D18': 'D18: TU Cupey -> Riveras de Cupey',
    'D26': 'D26: Piñero -> Trujillo Alto',
    'D27': 'D27: Martínez Nadal -> Guaynabo',
    'D37': 'D37: Cataño -> Levittown',
    'D45': 'D45: Sagrado -> Loíza Pueblo',
    'D53': 'D53: San Juan -> Aeropuerto',
    'D91': 'D91: TU Bayamón -> Santa Juanita',
    'D92': 'D92: TU Bayamón -> Magnolia',
}

import json

with open('subroutes.geojson', 'r') as data_file:
    old_data = json.load(data_file)
    new_data = {
        'type': 'FeatureCollection',
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        'features': []}
    new_features = {}
    for old_feat in old_data['features']:
        if not old_feat['geometry']['coordinates']:
            continue

        route_name = old_feat['properties']['name']
        if route_name in new_features:
            new_feat = new_features[route_name]
            new_feat['geometry']['coordinates'].append(old_feat['geometry']['coordinates'])
        else:
            new_feat = {
                'type': 'Feature',
                'properties': {
                    'id': route_name,
                    'color': '#' + colors_by_route[route_name],
                    'nombre': route_desc[route_name],
                },
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': [old_feat['geometry']['coordinates']]
                }
            }
            new_features[route_name] = new_feat

    new_features_list = sorted(list(new_features.values()), key=lambda x: x['properties']['id'])
    new_data['features'] = new_features_list

with open('rutas-ati.2015-09-01.geojson', 'w') as out_file:
    out_file.write(json.dumps(new_data))
