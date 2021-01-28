"use strict";
var device_1 = require("./device");
var supportsInputFormatting = require("../supports-input-formatting");
var ios_1 = require("./strategies/ios");
var android_chrome_1 = require("./strategies/android-chrome");
var kitkat_chromium_based_webview_1 = require("./strategies/kitkat-chromium-based-webview");
var ie9_1 = require("./strategies/ie9");
var base_1 = require("./strategies/base");
var noop_1 = require("./strategies/noop");
/**
 * Instances of this class can be used to modify the formatter for an input
 * @class
 * @param {object} options The initialization paramaters for this class
 * @param {object} options.element - A Input DOM object that RestrictedInput operates on
 * @param {string} options.pattern - The pattern to enforce on this element
 */
var RestrictedInput = /** @class */ (function () {
    function RestrictedInput(options) {
        if (!RestrictedInput.supportsFormatting()) {
            this.strategy = new noop_1.NoopKeyboardStrategy(options);
        }
        else if (device_1.isIos()) {
            this.strategy = new ios_1.IosStrategy(options);
        }
        else if (device_1.isKitKatWebview()) {
            this.strategy = new kitkat_chromium_based_webview_1.KitKatChromiumBasedWebViewStrategy(options);
        }
        else if (device_1.isAndroidChrome()) {
            this.strategy = new android_chrome_1.AndroidChromeStrategy(options);
        }
        else if (device_1.isIE9()) {
            this.strategy = new ie9_1.IE9Strategy(options);
        }
        else {
            this.strategy = new base_1.BaseStrategy(options);
        }
    }
    /**
     * @public
     * @returns {string} the unformatted value of the element
     */
    RestrictedInput.prototype.getUnformattedValue = function () {
        return this.strategy.getUnformattedValue();
    };
    /**
     * @public
     * @param {string} pattern - the pattern to enforce on the element
     * @return {void}
     */
    RestrictedInput.prototype.setPattern = function (pattern) {
        this.strategy.setPattern(pattern);
    };
    RestrictedInput.supportsFormatting = function () {
        return supportsInputFormatting();
    };
    return RestrictedInput;
}());
module.exports = RestrictedInput;