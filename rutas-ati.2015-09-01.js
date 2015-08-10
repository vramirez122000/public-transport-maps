var maya = (function () {

    var my = {};

    var DEFAULTS = {
        CENTER: [18.430189, -66.060061],
        ZOOM: 13,
        BOUNDS: [[18.352687, -66.179752],[18.477284, -65.928097]],
        MIN_ZOOM: 10,
        MAX_ZOOM: 19,
        ROUTE_COLOR_OPACITY: 0.8
    };

    my.main = function () {
        var param = getParam('routes');
        var routes = param && param.split(',') || [];
        var mapState = {
            colors: {},
            routeLayers: {},
            routeGroup: L.featureGroup(),
            layerControl: L.control.layers(null, {}, {position: 'topleft', collapsed: false}),
            map: createMap(),
            routes: routes
        };

        tileLayer().addTo(mapState.map);
        getAllRoutes(mapState, null);
    };

    function createMap() {
        return L.map('map', {
            center: DEFAULTS.CENTER,
            zoom: DEFAULTS.ZOOM
        });
    }

    function tileLayer() {
        var url = 'https://{s}.tiles.mapbox.com/v3/vramirez122000.kc4acpgn/{z}/{x}/{y}.png';
        return L.tileLayer(url, {
            minZoom: DEFAULTS.MIN_ZOOM,
            maxZoom: DEFAULTS.MAX_ZOOM,
            maxBounds: DEFAULTS.BOUNDS,
            attribution: '<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap Contributors</a>'
        });
    }

    function getAllRoutes(mapState, onComplete) {
        $.ajax('rutas-ati.2015-09-01.geojson', {
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: function (geojsonRoutes) {
                for (var i = 0; i < geojsonRoutes.features.length; i++) {
                    var data = geojsonRoutes.features[i];
                    if (mapState.routes.length > 0 && mapState.routes.indexOf(data.properties.id) == -1) {
                        continue;
                    }
                    var geoJsonLayer = L.geoJson(data, {
                        style: createRouteStyleFunction(),
                        onEachFeature: createOnEachRouteFunction(mapState)
                    });
                    mapState.colors[data.properties.id] = data.properties.color;
                    var lightColor = data.properties.color;
                    var darkColor = shadeColor(data.properties.color, -25);
                    var routeLabel = '<span class="routeLabel" ' +
                        'data-route-id="' + data.properties.id + '" style="' +
                        'background-color: ' + lightColor +
                        '; text-shadow: -1px 0 ' + darkColor + ', 0 1px ' + darkColor + ', 1px 0 ' + darkColor + ', 0 -1px ' + darkColor +
                        '; border-color: ' + darkColor + '">' + (data.properties.nombre) + '</span>';

                    mapState.routeGroup.addLayer(geoJsonLayer); //calc bounds
                    geoJsonLayer.addTo(mapState.map);
                    mapState.routeLayers[data.properties.id] = geoJsonLayer;
                    mapState.layerControl.addOverlay(geoJsonLayer, routeLabel);
                }
                mapState.layerControl.addTo(mapState.map);
            },
            complete: onComplete
        });
    }


    function createRouteStyleFunction() {
        return function (feature) {
            var style = {
                weight: 6,
                opacity: DEFAULTS.ROUTE_COLOR_OPACITY,
                color: feature.properties.color,
                lineCap: 'butt'
            };
            return style;
        };
    }

    function createOnEachRouteFunction(mapState) {
        return function (feature, layer) {
            layer.bindPopup(feature.properties.nombre);
            layer.on("click", function () {
                layer.bringToFront();
            });
        };
    }

    function getParam(name) {
        var paramKeyValPair = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search);
        if (paramKeyValPair) {
            var decoded = decodeURIComponent(paramKeyValPair[1]);
            if (decoded.indexOf('/') == (decoded.length - 1)) {
                decoded = decoded.substring(0, decoded.length - 1);
            }
            return decoded;
        }
    }

    function shadeColor(color, percent) {
        var num = parseInt(color.slice(1), 16);
        var amt = Math.round(2.55 * percent);
        var R = (num >> 16) + amt;
        var B = (num >> 8 & 0x00FF) + amt;
        var G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255))
                .toString(16).slice(1);
    }

    return my;
})();