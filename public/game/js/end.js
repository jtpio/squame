'use strict';

define([], function () {

    var game;
    var vfx;

    var text;
    var textStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };
    var fullText = 'Squame\n\nby @jtpio\n\n squame.jtp.io/game';

    function End(g, v) {
        game = g;
        vfx = v;
    }

    End.prototype.create = function () {
        text = game.add.text(game.world.centerX, game.world.centerY, fullText, textStyle);
        text.anchor.set(0.5);
        async.series([
            function (next) {
                vfx.gameFadeIn(next);
            },
            function (next) {
                setTimeout(next, 10000);
            },
            function (next) {
                vfx.gameFadeOut(next);
            }
        ], function () {
            game.state.start('Connect', true, false);
        });
    };

    return End;
});
