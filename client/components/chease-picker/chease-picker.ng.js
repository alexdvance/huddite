'use strict'

// angular.module('hud.cheasePicker')
angular.module('hudditeApp')

.directive('cheasePicker', [function() {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/chease-picker/chease-picker.view.ng.html',
    replace: true,
    link: function() {
      // mapData
      function mapData() {
        var labels = colorChease.domain();
        return labels.map(function(label) {
          return { label: label, value: cheaseDict[label] }
        });
      }


      // change
      function change(data) {
        function midAngle(d){
          return d.startAngle + (d.endAngle - d.startAngle)/2;
        }


        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
          .data(pie(data), key);

        slice.enter()
          .insert("path")
          .style("fill", function(d) { return colorChease(d.data.label); })
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


        /* ------- TEXT LABELS -------*/

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


        /* ------- SLICE TO TEXT POLYLINES -------*/

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
      };

      var key = function(d){
        return d.data.label;
      };

      var svg = d3.select("#chease-picker-graph")
        .append("svg")
        .append("g");

      svg.append("g")
        .attr("class", "slices");
      svg.append("g")
        .attr("class", "labels");
      svg.append("g")
        .attr("class", "lines");

      var width = 960;
      var height = 450;
      var radius = Math.min(width, height) / 2;

      var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
          return d.value;
        });

      var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

      var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

      svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      // CHEASE
      // Career Health Exercise Art Social Environment
      var cheaseDict = {
        Career: 2,
        Health: 1,
        Exercise: 1,
        Art: 3,
        Social: 1,
        Environment: 1,
      };

      var cheaseArray = Object.keys(cheaseDict);

      var COLORS = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

      var colorChease = d3.scale.ordinal()
        .domain(cheaseArray)
        .range(COLORS);

      change(mapData());

      d3.select(".randomize")
        .on("click", function(){
          change(mapData());
        });
    }
  };
}]);
