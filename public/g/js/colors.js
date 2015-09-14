'use strict';

define([
    '../../lib/color-scheme.min.js'
], function (ColorScheme) {

    var MIN = 0;
    var MAX = 1000;

    var palettes = {};

    var Colors = function () {

    };

    Colors.prototype.getPalette = function (hue) {
        if (palettes.hasOwnProperty(hue)) {
            return palettes[hue];
        }
        var scheme = new ColorScheme();
        var out = [];
        var base = parseInt(hue, 10) || 0;

        for (var i = 0; i < 3; i++) {
            scheme.from_hue(i * 5 + base)
                .scheme('analogic')
                .distance(0.1)
                .add_complement(false)
                .variation('default')
                .web_safe(false);

            out = out.concat(scheme.colors().map(function (c) {
                return '0x' + c;
            }));
        }

        palettes[hue] = out;
        return palettes[hue];
    };

    Colors.prototype.getPairs = function (n) {
        var scheme = new ColorScheme();
        var pairs = [];

        var step = Math.floor((MAX-MIN) / n);
        var start = 0;

        for (var i = 0; i < n; i++) {
            var base = parseInt(start + i * step, 10);

            scheme.from_hue(base)
                .scheme('mono')
                .distance(0.1)
                .add_complement(false)
                .variation('default')
                .web_safe(false);

            pairs.push(scheme.colors().map(function (c) {
                return '0x' + c;
            }));
        }
        return pairs;
    };

    return Colors;

});
