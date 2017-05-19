'use strict'

// angular.module('hud.cheasePicker')
angular.module('hudditeApp')

.directive('cheasePicker', [
    '$timeout',
    'PieChart',
    function($timeout, PieChart) {
        return {
            restrict: 'AE',
            templateUrl: 'client/components/chease-picker/chease-picker.view.ng.html',
            replace: true,
            link: function(scope, elem, attrs) {
                scope.spinning = false;

                function randomIntFromInterval(min, max) {
                    return Math.floor(Math.random() * (max - min + 1) + min);
                }

                var pieChartConfig = {
                    type: 'twister',
                    element: "#chease-picker-graph",
                    width: 680,
                    height: 450,
                    outerR: 280,
                    innerR: 8,
                    colors: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
                    // CHEASE
                    // Career Health Exercise Art Social Environment
                    slices: {
                        Career: 2,
                        Health: 1,
                        Exercise: 1,
                        Art: 3,
                        Social: 1,
                        Environment: 1,
                    },
                    minRotation: 1080,
                    maxRotation: 7200
                }

                PieChart.init(pieChartConfig);
                scope.spin = function() {
                    var spinResult = PieChart.spin();
                    $timeout(function() {
                        scope.spinResult = spinResult.selection.key.label;
                    }, spinResult.duration);
                }
            }
        };
}])

// Modified from http://bl.ocks.org/dbuezas/9306799
.service('PieChart', ['$timeout', function($timeout){
    const PI = 3.14159;
    var running = false;
    var boundaries = [];
    var deg = 0;
    var config;
    var svg;
    var pie;
    var radius;
    var arc;
    // var arcs, path, text;
    var outerArc;

    var key = function(d){
        return d.data.label;
    };

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    var setupPie = function() {
        pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });
    };

    var setupSVGElement = function() {
       svg = d3.select(config.element)
            .append("svg")
            .append("g");

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        radius = Math.min(config.width, config.height) / 2;

        arc = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        outerArc = d3.svg.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        svg.attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");
    };


    // drawPieChart
    var drawPieChart = function(sliceOrdinal) {
        /* ------- PIE SLICES -------*/
        function drawSlices() {
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            pie(data).forEach(function(a) {
                boundaries.push({
                    key: a.data,
                    start: a.startAngle,
                    end: a.endAngle
                });
            });

            slice.enter()
                .insert("path")
                .style("fill", function(d) { return sliceOrdinal(d.data.label); })
                .attr("class", "slice");

            slice
                .transition().duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.exit()
                .remove();
        }

        /* ------- SPINNER -------*/
        function drawSpinner() {
            var slices = svg.select(".slices");

            var spinnerPointsDict = {
                wheelOfFortune: (-config.outerR/24) + ", " +
                    (-config.outerR - config.outerR/12) + " " +
                    (config.outerR/24) + "," +
                    (-config.outerR - config.outerR/12) + " " +
                    "0," +
                    (-config.outerR - config.outerR/12 + 40),
                twister: (-config.outerR/24) + ", " +
                    "0 " +
                    (config.outerR/24) + "," +
                    " 0 " +
                    " 0," +
                    (-config.outerR/3)
               };
            var spinnerCirclePointsDict = {
                wheelOfFortune: -config.outerR - config.outerR/12,
                twister: 0
            };


            slices.append("polygon")
               .attr("fill", "lightgray")
               .attr("points", spinnerPointsDict[config.type])
               .attr('class', 'pointer')
               .style('opacity', 1);

            slices.append("circle")
               .attr("cx", 0)
               .attr("cy", spinnerCirclePointsDict[config.type])
               .attr("r", config.outerR/24)
               .attr("fill", "lightgray");
        };


        /* ------- TEXT LABELS -------*/
        function drawLabels() {
            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.data.label;
                });

            text.transition().duration(1000)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate("+ pos +")";
                    };
                })
                .styleTween("text-anchor", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                });

            text.exit()
                .remove();
        }


        /* ------- SLICE TO TEXT POLYLINES -------*/
        function drawPolylines() {
            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        }

        var labels = sliceOrdinal.domain();

        var data = labels.map(function(label) {
            return { label: label, value: config.slices[label] }
        });

        drawSlices();
        drawSpinner();
        drawLabels();
        drawPolylines();
    };


    var init = function(_config) {
        config = _config;

        setupPie();
        setupSVGElement();

        var labels = Object.keys(config.slices);

        // Creates d3 ordinal object with labels and colors
        var sliceOrdinal = d3.scale.ordinal()
            .domain(labels)
            .range(config.colors);

        drawPieChart(sliceOrdinal);
    };

    var selectedSlice = function(deg) {
        deg = deg % 360;
        // For the twister spinner, cross multiply to convert
        // degrees to fraction out of 2πr (r = 1)
        // deg/360 === X/(2 * PI)
        var pointerDict = {
            'wheelOfFortune': (360 - deg)*(PI/180),
            'twister': (deg * PI * 2)/360
        };

        var pointer = pointerDict[config.type];
        var result;

        boundaries.forEach(function(x) {
            if (x.start < pointer && x.end > pointer) {
                result = x;
            }
        });
        return result;
    };

    var spin = function(degrees, duration) {
        var tagToSpinDict = {
            'wheelOfFortune': 'g.slice',
            'twister': 'polygon',
        }

        var running = !running;

        if (!running) { spin(); }

        deg = degrees || Math.floor( (Math.random() * config.maxRotation) + config.minRotation);
        duration = (duration !== undefined) ? duration : (deg*500)/360;

        svg.selectAll(tagToSpinDict[config.type]).transition()
            .ease("quad-out")
            .duration(duration)
            .attrTween("transform", function() {
                return d3.interpolateString("rotate(0)", "rotate(" + deg + ")");
            });

        return {
            duration: duration,
            selection: selectedSlice(deg)
        };
    };

    return {
        init: init,
        spin: spin
    };
}]);
