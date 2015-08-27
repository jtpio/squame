'use strict';

define([
], function () {

    var game;

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
        console.log(game.world.alpha);
        return fade(1, cb);
    };

    return Vfx;

});
