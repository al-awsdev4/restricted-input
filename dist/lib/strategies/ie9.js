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
exports.IE9Strategy = void 0;
var base_1 = require("./base");
var key_cannot_mutate_value_1 = require("../key-cannot-mutate-value");
var input_selection_1 = require("../input-selection");
function padSelection(selection, pad) {
    return {
        start: selection.start + pad,
        end: selection.end + pad,
    };
}
var IE9Strategy = /** @class */ (function (_super) {
    __extends(IE9Strategy, _super);
    function IE9Strategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IE9Strategy.prototype.getUnformattedValue = function () {
        return base_1.BaseStrategy.prototype.getUnformattedValue.call(this, true);
    };
    IE9Strategy.prototype.attachListeners = function () {
        var _this = this;
        this.inputElement.addEventListener("keydown", function (event) {
            _this.keydownListener(event);
        });
        this.inputElement.addEventListener("focus", function () {
            _this.format();
        });
        this.inputElement.addEventListener("paste", function (event) {
            _this.pasteEventHandler(event);
        });
    };
    IE9Strategy.prototype.format = function () {
        var input = this.inputElement;
        var stateToFormat = this.getStateToFormat();
        var formattedState = this.formatter.format(stateToFormat);
        input.value = formattedState.value;
        input_selection_1.set(input, formattedState.selection.start, formattedState.selection.end);
    };
    IE9Strategy.prototype.keydownListener = function (event) {
        if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
            return;
        }
        event.preventDefault();
        if (this.isDeletion(event)) {
            this.stateToFormat = this.formatter.simulateDeletion({
                event: event,
                selection: input_selection_1.get(this.inputElement),
                value: this.inputElement.value,
            });
        }
        else {
            // IE9 does not update the input's value attribute
            // during key events, only after they complete.
            // We must retrieve the key from event.key and
            // add it to the input's value before formatting.
            var oldValue = this.inputElement.value;
            var selection = input_selection_1.get(this.inputElement);
            var newValue = oldValue.slice(0, selection.start) +
                event.key +
                oldValue.slice(selection.start);
            selection = padSelection(selection, 1);
            this.stateToFormat = {
                selection: selection,
                value: newValue,
            };
            if (selection.start === newValue.length) {
                this.stateToFormat = this.formatter.unformat(this.stateToFormat);
            }
        }
        this.format();
    };
    IE9Strategy.prototype.reformatAfterPaste = function () {
        var input = this.inputElement;
        var selection = input_selection_1.get(this.inputElement);
        var value = this.formatter.format({
            selection: selection,
            value: input.value,
        }).value;
        selection = padSelection(selection, 1);
        input.value = value;
        // IE9 sets the selection to the end of the input
        // manually setting it in a setTimeout puts it
        // in the correct position after pasting
        setTimeout(function () {
            input_selection_1.set(input, selection.start, selection.end);
        }, 0);
    };
    return IE9Strategy;
}(base_1.BaseStrategy));
exports.IE9Strategy = IE9Strategy;
