'use strict';

define([
    './colors',
    './generator'
], function (Colors, Generator) {

    // game logic
    var game;
    var playerManager;
    var gen;
    var running = 0;

    // graphics
    var vfx;
    var graphics;
    var colorScheme = new Colors();
    var goodColors = colorScheme.getPalette(500);
    var badColors = colorScheme.getPalette(0);
    var STEPS = 100;

    // sound
    var winSound;

    // levels
    var nbLevels = 4;
    var progress;
    var lvls;
    var curr;

    // voronoi
    var voronoi = new Voronoi();
    var bbox;
    var moving;
    var speeds;
    var moved;
    var diagram;

    function easingFun(t) {
        // return (Math.cos(t + Math.PI) + 1) / 2;
        return Math.abs(Math.sin(t));
    }

    function move() {
        lvls[curr].sites.forEach(function (s, i) {
            if (moving[s.owner]) {
                Phaser.Point.interpolate(
                    lvls[curr].sites_start[i],
                    lvls[curr].sites_end[i],
                    easingFun(moved[s.owner]/1000*speeds[s.owner]),
                    s
                );
            }
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

    function start() {
        vfx.gameFadeIn(function () {
            running = 1;
            playerManager.setupPlayers();
            playerManager.on('move', function (p) {
                moving[p] = true;
            });
            playerManager.on('stop', function (p) {
                moving[p] = false;
            });
        });
    }

    function stop() {
        winSound.play();
        running = 0;
        playerManager.clearPlayers();
        playerManager.off();
        vfx.gameFadeOut(function () {
            game.state.restart(true, false, curr+1);
        });
    }

    var Level = function (g, pm, v) {
        game = g;
        playerManager = pm;
        vfx = v;
        bbox = {xl: 0, xr: game.width, yt: 0, yb: game.height};

        lvls = {};
        curr = 1;
        gen = new Generator();

    };

    Level.prototype.preload = function () {
        graphics = game.add.graphics(0, 0);
        game.load.audio('win', ['../../assets/sounds/Jingle_Achievement_00.wav']);

        for (var i = 1; i <= nbLevels; i++) {
            game.load.json('lvl'+i, '../../assets/levels/' + i + '.json');
        }
    };

    Level.prototype.create = function () {
        winSound = game.add.audio('win');

        graphics.clear();

        for (var i = 1; i <= nbLevels; i++) {
            var data = game.cache.getJSON('lvl'+i);
            lvls[i] = gen.new({
                bbox: bbox,
                width: game.width,
                height: game.height,
                players: data.players,
                nb: data.points
            });
            speeds = [data.speed1 || 0.25, data.speed2 || 0.25];
        }

        progress = 0;
        moving = [false, false];
        moved = [0, 0];

        voronoi.recycle(diagram);
        diagram = voronoi.compute(lvls[curr].sites, bbox);
        diagram.cells.forEach(function (c, i) {
            c.site.colorId = i % badColors.length;
        });
    };

    Level.prototype.init = function (lvl) {
        curr = lvl || 1;
        if (curr > nbLevels) {
            return game.state.start('End', true, false);
        }
        playerManager.clearPlayers();
        start();
    };

    Level.prototype.update = function () {
        if (!running) {
            return;
        }
        if (moving[0] || moving[1]) {
            moved[0] += moving[0] ? game.time.elapsed : 0;
            moved[1] += moving[1] ? game.time.elapsed : 0;
            move();
            voronoi.recycle(diagram);
            diagram = voronoi.compute(lvls[curr].sites, bbox);
            progress = score(lvls[curr].sites_start, lvls[curr].sites, lvls[curr].sites_end);

            if (progress > 0.99) {
                stop();
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
            graphics.lineStyle(10, 0x000000, 1);
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

    return Level;

});
