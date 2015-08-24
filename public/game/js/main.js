'use strict';

requirejs([
    './playerManager',
    './networkManager'
], function (PlayerManager, NetworkManager) {

    var W = window.innerWidth;
    var H = window.innerHeight;
    var graphics;

    var game;
    var playerManager;
    var networkManager;

    var voronoi = new Voronoi();
    var diagram;
    var sites = [];
    var bbox = {xl: 0, xr: W, yt: 0, yb: H};

    var colors = [];
    for (var i = 0; i < 1000; i++) {
        colors.push(Phaser.Color.getRandomColor());
    }

    function genXY(id) {
        return {
            x: Math.round(bbox.xl + Math.random()*(bbox.xr-bbox.xl)),
            y: Math.round(bbox.yt + Math.random()*(bbox.yb-bbox.yt))
        };
    }

    function preload() {
        // game.time.advancedTiming = true;
        playerManager = new PlayerManager(game);
        networkManager = new NetworkManager(game, playerManager);
    }

    function create() {

        graphics = game.add.graphics(0, 0);

        async.series([
            function (callback) {
                networkManager.setupServer(function (gameID) {
                    callback();
                });
            },
            function (callback) {
                for (var i = 0; i < 20; i++) {
                    sites.push(genXY(i));
                }
                callback();
            }
        ], function (err, results) {
            console.log('ready');
            diagram = voronoi.compute(sites, bbox);
        });

    }

    function update() {
        /*
        voronoi.recycle(diagram);
        sites = sites.map(function (s) {
            return {
                x: Phaser.Math.clamp(s.x + (Math.random()-0.5) * 2, bbox.xl, bbox.xr),
                y: Phaser.Math.clamp(s.y + (Math.random()-0.5) * 2, bbox.yt, bbox.yb)
            };
        });
        */
    }

    function render() {
        if (!diagram) {
            return;
        }
        var cells = diagram.cells;
        graphics.clear();
        cells.forEach(function (c) {
            var site = c.site;

            var halfedges = c.halfedges;
            var len = halfedges.length;
            var v = halfedges[0].getStartpoint();
            graphics.lineStyle(1, 0x000000, 0.1);
            graphics.beginFill(colors[site.voronoiId]);
    		graphics.moveTo(v.x,v.y);
    		for (var i = 0; i < len; i++) {
    			v = halfedges[i].getEndpoint();
    			graphics.lineTo(v.x,v.y);
    		}
            graphics.endFill();
        });
    }

    game = new Phaser.Game(W, H, Phaser.AUTO, 'game-container', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

});
