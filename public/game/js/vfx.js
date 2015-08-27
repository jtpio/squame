'use strict';

define([
], function () {

    var game;
    var colors;
    var squares;
    var players;

    var Vfx = function (g) {
        game = g;
    };

    function fade(to, cb) {
        var tween = game.add.tween(game.world).to({ alpha: to }, 500, 'Linear', true);
        tween.onComplete.add(function () {
            if (cb) {
                return cb();
            }
        }, tween);
    }

    Vfx.prototype.gameFadeOut = function (cb) {
        return fade(0, cb);
    };

    Vfx.prototype.gameFadeIn = function (cb) {
        return fade(1, cb);
    };

    Vfx.prototype.flash = function () {
        squares.forEach(function (s) {
            game.add.tween(s)
                .to({ alpha: 0 }, 500, Phaser.Easing.Bounce.Out, true, 0)
                .yoyo(1)
                .delay(game.rnd.between(1500, 3000));
        });
    };

    Vfx.prototype.displayPlayers = function () {
        squares = [game.add.graphics(0,0), game.add.graphics(0,0)];
        colors = [0xff1400, 0xcfff00];

        var w1 = game.rnd.between(0.10*game.height, 0.25*game.height);
        var w2 = game.rnd.between(0.10*game.height, 0.25*game.height);

        players = [
            new Phaser.Rectangle(
                game.rnd.between(0.10*game.width, 0.75*game.width),
                game.rnd.between(0.10*game.height, 0.25*game.height),
                w1, w1
            ),
            new Phaser.Rectangle(
                game.rnd.between(0.25*game.width, 0.75*game.width),
                game.rnd.between(0.5*game.height, 0.75*game.height),
                w2, w2
            )
        ];
    };

    Vfx.prototype.renderPlayers = function (n) {
        squares.forEach(function (s) {
            s.clear();
        });

        for (var i = 0; i < n; i++) {
            var p = players[i];
            squares[i].lineStyle(1, 0xffffff, 1);
            squares[i].beginFill(colors[i]);
            squares[i].drawRect(p.x, p.y, p.width, p.height);
            squares[i].endFill();
        }

    };

    return Vfx;

});
