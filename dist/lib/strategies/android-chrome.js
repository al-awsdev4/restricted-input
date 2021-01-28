"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndroidChromeStrategy = void 0;
var key_cannot_mutate_value_1 = require("../key-cannot-mutate-value");
var base_1 = require("./base");
var input_selection_1 = require("../input-selection");
var AndroidChromeStrategy = /** @class */ (function (_super) {
    __extends(AndroidChromeStrategy, _super);
    function AndroidChromeStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AndroidChromeStrategy.prototype.attachListeners = function () {
        var _this = this;
        this.inputElement.addEventListener("keydown", function (event) {
            if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
                return;
            }
            _this.unformatInput();
        });
        // 'keypress' is not fired with some Android keyboards (see #23)
        this.inputElement.addEventListener("keypress", function (event) {
            if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
                return;
            }
            _this.unformatInput();
        });
        this.inputElement.addEventListener("keyup", function () {
            _this.reformatInput();
        });
        this.inputElement.addEventListener("input", function () {
            _this.reformatInput();
        });
        this.inputElement.addEventListener("paste", function (event) {
            event.preventDefault();
            _this.pasteEventHandler(event);
        });
    };
    AndroidChromeStrategy.prototype.prePasteEventHandler = function () {
        // the default strategy calls preventDefault here
        // but that removes the clipboard data in Android chrome
        // so we noop instead
    };
    AndroidChromeStrategy.prototype.postPasteEventHandler = function () {
        var _this = this;
        // the default strategy calls this without a timeout
        setTimeout(function () {
            _this.reformatAfterPaste();
        }, 0);
    };
    AndroidChromeStrategy.prototype.afterReformatInput = function (formattedState) {
        var input = this.inputElement;
        // Some Android Chrome keyboards (notably Samsung)
        // cause the browser to not know that the value
        // of the input has changed when adding
        // permacharacters. This results in the selection
        // putting the cursor before the permacharacter,
        // instead of after.
        //
        // There is also the case of some Android Chrome
        // keyboards reporting a ranged selection on the
        // first character input. Restricted Input maintains
        // that range even though it is incorrect from the
        // keyboard.
        //
        // To resolve these issues we setTimeout and reset
        // the selection to the formatted end position.
        setTimeout(function () {
            var formattedSelection = formattedState.selection;
            input_selection_1.set(input, formattedSelection.end, formattedSelection.end);
        }, 0);
    };
    return AndroidChromeStrategy;
}(base_1.BaseStrategy));
exports.AndroidChromeStrategy = AndroidChromeStrategy;
