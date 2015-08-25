'use strict';

define([
    './colors'
], function (Colors) {

    var game;
    var playerManager;

    var diagram;
    var sites = [];
    var sites_start = [];
    var sites_end = [];
    var voronoi = new Voronoi();
    var bbox = {xl: 0, xr: 0, yt: 0, yb: 0};
    var moving = false;
    var speed = 0.1;
    var graphics;

    var colorScheme = new Colors();
    var colors = colorScheme.getPalette(0);

    // time
    var lastTime;
    var moved = 0;

    function genXY() {
        return {
            x: Math.round(bbox.xl + Math.random()*(bbox.xr-bbox.xl)),
            y: Math.round(bbox.yt + Math.random()*(bbox.yb-bbox.yt))
        };
    }

    function easingFun(t) {
        return Math.abs(Math.sin(t));
    }

    function move (moved) {
        var ts = moved / 1000;
        sites.forEach(function (s, i) {
            Phaser.Point.interpolate(sites_start[i], sites_end[i], easingFun(ts*speed), s);
        });
    }

    function tile() {
        var sw = game.width/5;
        var sh = game.height/5;
        sites = [];
        for (var i = sw/2; i < game.width; i+=sw) {
            for (var j = sh/2; j < game.height; j+=sh) {
                var start = new Phaser.Point(i,j);
                sites.push(start);
            }
        }
        sites_start = sites.map(function (p) {
            return p.clone();
        });
        sites_end = sites.map(genXY);
    }

    var Level = function (g, pm) {
        game = g;
        playerManager = pm;
        bbox.xr = game.width;
        bbox.yb = game.height;
    };

    Level.prototype.preload = function () {
        graphics = game.add.graphics(0, 0);
    };

    Level.prototype.create = function () {

        playerManager.on('move', function () {
            moving = true;
        });
        playerManager.on('stop', function () {
            moving = false;
        });

        tile();
        voronoi.recycle(diagram);
        diagram = voronoi.compute(sites, bbox);
        diagram.cells.forEach(function (c, i) {
            c.site.color = colors[i % colors.length];
        });
    };

    Level.prototype.update = function () {
        if (moving) {
            moved += game.time.elapsed;
            move(moved);
            voronoi.recycle(diagram);
            diagram = voronoi.compute(sites, bbox);
            lastTime = game.time.now;
        }
    };

    Level.prototype.render = function () {
        if (!diagram) {
            return;
        }
        var cells = diagram.cells;
        graphics.clear();
        cells.forEach(function (c) {
            var site = c.site;
            var halfedges = c.halfedges;
            var len = halfedges.length;
            if (len === 0) return;
            var v = halfedges[0].getStartpoint();
            graphics.lineStyle(5, 0x000000, 1);
            graphics.beginFill(site.color);
    		graphics.moveTo(v.x,v.y);
    		for (var i = 0; i < len; i++) {
    			v = halfedges[i].getEndpoint();
    			graphics.lineTo(v.x,v.y);
    		}
            graphics.endFill();
        });
    };

    return Level;

});
