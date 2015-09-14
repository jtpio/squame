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
    var pairs = _.shuffle(colorScheme.getPairs(100));
    var STEPS = 100;

    // sound
    var winSound;
    var music;

    // levels
    var nbLevels = 4;
    var progress;
    var lvls;
    var curr;

    // voronoi
    var voronoi = new Voronoi();
    var bbox;
    var moving;
    var diagram;

    function move() {
        lvls[curr].sites.forEach(function (s, i) {
            Phaser.Point.interpolate(
                lvls[curr].sites_start[i],
                lvls[curr].sites_end[i],
                gen.easingFun(s.moved/1000*0.75),
                s
            );
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

    function findAndAssignSite(p) {
        var n = lvls[curr].sites.length;
        var available;
        for (var i = 0; i < n; i++) {
            var m = ((p.site || 0) + i) % n;
            var s = lvls[curr].sites[m];
            if (s && !s.hasOwnProperty('owner')) {
                available = s;
                break;
            }
        }
        if (available) {
            // clear previous ownership first
            if (p.hasOwnProperty('site') && lvls[curr].sites[p.site]) {
                delete lvls[curr].sites[p.site].owner;
                delete p.site;
            }
            // assign new ownership
            available.owner = p.id;
            p.site = _.indexOf(lvls[curr].sites, available);
            p.send('color', pairs[available.colorId][0]);
        }
    }

    function start() {
        vfx.gameFadeIn(function () {
            playerManager.setupPlayers();
            playerManager.on('move', function (p) {
                if (!running) { return; }
                moving[p.id] = true;
            });
            playerManager.on('stop', function (p) {
                if (!running) { return; }
                moving[p.id] = false;
            });
            playerManager.on('switch', function (p) {
                if (!running) { return; }
                findAndAssignSite(p);
            });
            playerManager.on('newPlayer', function (p) {
                if (!running) { return; }
                findAndAssignSite(p);
            });
            playerManager.on('leavePlayer', function (p) {
                if (!running) { return; }

                if (p.hasOwnProperty('site') && lvls[curr].sites[p.site]) {
                    delete lvls[curr].sites[p.site].owner;
                    delete p.site;
                }
            });

            // at startup, assign one site per player
            var players = playerManager.getPlayers();
            Object.keys(players).forEach(function (playerId, i) {
                var p = players[playerId];
                lvls[curr].sites[i].owner = p.id;
                p.site = i;
            });

            lvls[curr].sites.forEach(function (s, i) {
                s.colorId = i;
                s.phase = Math.random() * Math.PI * 0.5;
            });

            running = 1;
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
        var skipKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        skipKey.onUp.add(function () {
            stop();
        });
        graphics = game.add.graphics(0, 0);

        game.load.audio('music', ['../../assets/sounds/Dream.ogg', '../../assets/sounds/Dream.mp3']);
        game.load.audio('win', ['../../assets/sounds/Jingle_Achievement_00.ogg', '../../assets/sounds/Jingle_Achievement_00.mp3']);

        for (var i = 1; i <= nbLevels; i++) {
            game.load.json('lvl'+i, '../../assets/levels/' + i + '.json');
        }
    };

    Level.prototype.create = function () {
        winSound = game.add.audio('win');
        music = game.add.audio('music');

        music.volume = 1;
        music.loop = true;
        music.play();
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
        }

        progress = 0;
        moving = {};

        voronoi.recycle(diagram);
        diagram = voronoi.compute(lvls[curr].sites, bbox);
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

        music._sound.playbackRate.value = Math.min(progress + 0.1, 1.2);

        var players = playerManager.getPlayers();
        var hasMoved = false;

        for (var p in players) {
            var player = players[p];
            if (!lvls[curr].sites[player.site]) {
                continue;
            }
            lvls[curr].sites[player.site].moved += moving[player.id] ? game.time.elapsed : 0;
            hasMoved = hasMoved || moving[player.id];
        }
        // if movement
        if (hasMoved) {
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
        if (!diagram) {
            return;
        }
        var cells = diagram.cells;
        graphics.clear();
        lvls[curr].sites.forEach(function (s) {
            // lookup the correct cell
            var c = cells[s.voronoiId];
            var halfedges = c.halfedges;
            var len = halfedges.length;
            if (len === 0) return;
            var v = halfedges[0].getStartpoint();
            graphics.lineStyle(10, 0x000000, 1);
            var mainColor = s.hasOwnProperty('owner') ?
                Phaser.Color.interpolateColor(
                    pairs[s.colorId][0], pairs[s.colorId][2],
                    STEPS, Math.abs(Math.sin(Date.now() / 1000 + s.phase)) * STEPS, 1)
                : 0xffffff;
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
