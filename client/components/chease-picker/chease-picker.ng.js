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

                scope.spin = function() {
                    var LENGTH_OF_SPIN = 1000;
                    var MIN_SPINS = 4;
                    var INTERVALS = 360;
                    var INTERVAL_LENGTH = LENGTH_OF_SPIN / INTERVALS;

                    var randomIntervalCount = randomIntFromInterval(1, INTERVALS);
                    var waitTime = 0;

                    waitTime = LENGTH_OF_SPIN * MIN_SPINS;
                    waitTime += INTERVAL_LENGTH  * randomIntervalCount;

                    scope.spinning = true;

                    $timeout(function() {
                        var spinnerWrapper = elem.find('.spinner--wrapper');
                        scope.spinning = false;
                    }, waitTime);
                };

                var pieChartConfig = {
                    element: "#chease-picker-graph",
                    width: 960,
                    height: 450,
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
                }

                PieChart.init(pieChartConfig);

                // d3.select(".randomize")
                //     .on("click", function(){
                //         PieChart.change(mapData());
                //     });
            }
        };
}])

// Modified from http://bl.ocks.org/dbuezas/9306799
.service('PieChart', ['$timeout', function($timeout){
    var config;
    var svg;
    var pie;
    var radius;
    var arc;
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
    }

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
    }

    this.init = function(_config) {
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

    // drawPieChart
    var drawPieChart = function(sliceOrdinal) {
        /* ------- PIE SLICES -------*/
        function drawSlices() {
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

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

        var data = sliceOrdinal.domain().map(function(label) {
            return { label: label, value: config.slices[label] }
        });

        drawSlices();
        drawLabels();
        drawPolylines();
    };
}]);
