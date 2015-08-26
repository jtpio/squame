'use strict';

define([
    './colors',
    './generator'
], function (Colors, Generator) {

    // game logic
    var game;
    var playerManager;
    var gen;

    // graphics
    var graphics;
    var colorScheme = new Colors();
    var goodColors = colorScheme.getPalette(500);
    var badColors = colorScheme.getPalette(0);
    var STEPS = 100;

    // levels
    var nbLevels = 3;
    var progress;
    var lvls;
    var curr;

    // voronoi
    var voronoi = new Voronoi();
    var bbox;
    var moving;
    var diagram;

    // time
    var lastTime;
    var moved;

    // gameID text
    var idStyle;
    var text;

    function easingFun(t) {
        return (Math.sin(t)+1)/2;
    }

    function move (moved) {
        var ts = moved / 1000;
        lvls[curr].sites.forEach(function (s, i) {
            Phaser.Point.interpolate(lvls[curr].sites_start[i], lvls[curr].sites_end[i], easingFun(ts*lvls[curr].speed), s);
        });
    }

    // curr and end must have the same size
    function score(start, curr, end) {
        var n = curr.length;
        var res = 0;
        var max = 0;
        for (var i = 0; i < n; i++) {
            res += Phaser.Point.distance(curr[i], end[i]);
            max += Phaser.Point.distance(start[i], end[i]);
        }
        return 1 - Phaser.Math.clamp(res / max, 0, 1);
    }

    var Level = function (g, pm) {
        game = g;
        playerManager = pm;
        bbox = {xl: 0, xr: game.width, yt: 0, yb: game.height};
        idStyle = { font: '65px Arial', fill: '#000000', align: 'center' };

        lvls = {};
        curr = 1;
        gen = new Generator();

    };

    Level.prototype.preload = function () {
        graphics = game.add.graphics(0, 0);
        text = game.add.text(50, 50, game.gameID, idStyle);
        text.anchor.set(0.5);

        for (var i = 1; i <= nbLevels; i++) {
            game.load.json('lvl'+i, '../../assets/levels/' + i + '.json');
        }
    };

    Level.prototype.create = function () {
        graphics.clear();

        playerManager.setupPlayer();
        playerManager.on('move', function () {
            moving = true;
        });
        playerManager.on('stop', function () {
            moving = false;
        });

        for (var i = 1; i <= nbLevels; i++) {
            var data = game.cache.getJSON('lvl'+i);
            lvls[i] = gen.new({
                bbox: bbox,
                width: game.width,
                height: game.height,
                players: data.players,
                nb: data.points
            });
            lvls[i].speed = data.speed || 0.25;
        }

        progress = 0;
        moving = false;
        moved = 0;

        voronoi.recycle(diagram);
        diagram = voronoi.compute(lvls[curr].sites, bbox);
        diagram.cells.forEach(function (c, i) {
            c.site.colorId = i % badColors.length;
        });
    };

    Level.prototype.init = function (lvl) {
        curr = lvl || 1;
        playerManager.clearPlayer();
        game.world.alpha = 1;
    };

    Level.prototype.update = function () {
        if (moving) {
            moved += game.time.elapsed;
            move(moved);
            voronoi.recycle(diagram);
            diagram = voronoi.compute(lvls[curr].sites, bbox);
            lastTime = game.time.now;
            progress = score(lvls[curr].sites_start, lvls[curr].sites, lvls[curr].sites_end);

            if (progress > 0.99) {
                game.state.restart(true, false, curr+1);
            }
        }
    };

    Level.prototype.render = function () {
        game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');
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
            var mainColor = Phaser.Color.interpolateColor(badColors[site.colorId], goodColors[site.colorId], STEPS, progress * STEPS, 1);
            graphics.beginFill(mainColor);
    		graphics.moveTo(v.x,v.y);
    		for (var i = 0; i < len; i++) {
    			v = halfedges[i].getEndpoint();
    			graphics.lineTo(v.x,v.y);
    		}
            graphics.endFill();
        });
    };

    Level.prototype.shutdown = function () {
        playerManager.clearPlayer();
    };

    return Level;

});
