'use strict';

define([

], function () {

    var Generator = function () {

    };

    function genXY(bbox) {
        return {
            x: Math.round(bbox.xl + Math.random()*(bbox.xr-bbox.xl)),
            y: Math.round(bbox.yt + Math.random()*(bbox.yb-bbox.yt))
        };
    }

    Generator.prototype.new = function (params) {
        var n = params.nb;
        var w = params.width;
        var h = params.height;
        var sw = params.width / n;
        var sh = params.height / n;
        var sites_start = [];
        var sites_end = [];

        for (var i = sw/2; i < w; i+=sw) {
            for (var j = sh/2; j < h; j+=sh) {
                var e = genXY(params.bbox);
                var start = new Phaser.Point(e.x, e.y);
                var end = new Phaser.Point(i,j);
                sites_start.push(start);
                sites_end.push(end);
            }
        }
        var sites = sites_start.map(function (p, i) {
            var copy = p.clone();
            copy.owner = (i < sites_start.length/2) ? 0 : 1;
            Phaser.Point.interpolate(sites_start[i], sites_end[i], copy.owner * 0.5, copy);
            return copy;
        });

        return {
            sites: sites,
            sites_start: sites_start,
            sites_end: sites_end
        };
    };

    return Generator;

});
