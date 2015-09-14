'use strict';

define([
], function () {

    var game;
    var playerManager;

    var vfx;

    var title;
    var titleStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };

    function transition() {
        setTimeout(function () {
            vfx.gameFadeOut(function () {
                game.state.start('Level', true, false);
            });
        }, 1000);
    }

    function Connect(g, pm, v) {
        game = g;
        playerManager = pm;
        vfx = v;
    }

    Connect.prototype.create = function () {
        title = game.add.text(game.world.centerX, game.world.centerY, 'Squame', titleStyle);
        title.anchor.set(0.5);

        $('#url').text(game.url);

        vfx.gameFadeIn();

        transition();

    };

    return Connect;
});
