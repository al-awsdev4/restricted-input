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
exports.BaseStrategy = void 0;
var strategy_interface_1 = require("./strategy-interface");
var key_cannot_mutate_value_1 = require("../key-cannot-mutate-value");
var input_selection_1 = require("../input-selection");
var is_backspace_1 = require("../is-backspace");
var is_delete_1 = require("../is-delete");
var formatter_1 = require("../formatter");
function isSimulatedEvent(event) {
    // 1Password sets input.value then fires keyboard events. Dependent on browser
    // here might be falsy values (key = '', keyCode = 0) or these keys might be omitted
    // Chrome autofill inserts keys all at once and fires a single event without key info
    return !event.key && !event.keyCode;
}
var BaseStrategy = /** @class */ (function (_super) {
    __extends(BaseStrategy, _super);
    function BaseStrategy(options) {
        var _this = _super.call(this, options) || this;
        _this.formatter = new formatter_1.PatternFormatter(options.pattern);
        _this.onPasteEvent = options.onPasteEvent;
        _this.attachListeners();
        _this.formatIfNotEmpty();
        return _this;
    }
    BaseStrategy.prototype.getUnformattedValue = function (forceUnformat) {
        var value = this.inputElement.value;
        if (forceUnformat || this.isFormatted) {
            value = this.formatter.unformat({
                value: this.inputElement.value,
                selection: { start: 0, end: 0 },
            }).value;
        }
        return value;
    };
    BaseStrategy.prototype.formatIfNotEmpty = function () {
        if (this.inputElement.value) {
            this.reformatInput();
        }
    };
    BaseStrategy.prototype.setPattern = function (pattern) {
        this.unformatInput();
        this.formatter = new formatter_1.PatternFormatter(pattern);
        this.formatIfNotEmpty();
    };
    BaseStrategy.prototype.attachListeners = function () {
        var _this = this;
        this.inputElement.addEventListener("keydown", function (e) {
            var event = e;
            if (isSimulatedEvent(event)) {
                _this.isFormatted = false;
            }
            if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
                return;
            }
            if (_this.isDeletion(event)) {
                _this.unformatInput();
            }
        });
        this.inputElement.addEventListener("keypress", function (e) {
            var event = e;
            if (isSimulatedEvent(event)) {
                _this.isFormatted = false;
            }
            if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
                return;
            }
            _this.unformatInput();
        });
        this.inputElement.addEventListener("keyup", function () {
            _this.reformatInput();
        });
        this.inputElement.addEventListener("input", function (event) {
            // Safari AutoFill fires CustomEvents
            // LastPass sends an `isTrusted: false` property
            // Since the input is changed all at once, set isFormatted
            // to false so that reformatting actually occurs
            if (event instanceof CustomEvent || !event.isTrusted) {
                _this.isFormatted = false;
            }
            _this.reformatInput();
        });
        this.inputElement.addEventListener("paste", function (event) {
            _this.pasteEventHandler(event);
        });
    };
    BaseStrategy.prototype.isDeletion = function (event) {
        return is_delete_1.isDelete(event) || is_backspace_1.isBackspace(event);
    };
    BaseStrategy.prototype.reformatInput = function () {
        if (this.isFormatted) {
            return;
        }
        this.isFormatted = true;
        var input = this.inputElement;
        var formattedState = this.formatter.format({
            selection: input_selection_1.get(input),
            value: input.value,
        });
        input.value = formattedState.value;
        input_selection_1.set(input, formattedState.selection.start, formattedState.selection.end);
        this.afterReformatInput(formattedState);
    };
    // If a strategy needs to impliment specific behavior
    // after reformatting has happend, the strategy just
    // overwrites this method on their own prototype
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseStrategy.prototype.afterReformatInput = function (formattedState) {
        // noop
    };
    BaseStrategy.prototype.unformatInput = function () {
        if (!this.isFormatted) {
            return;
        }
        this.isFormatted = false;
        var input = this.inputElement;
        var selection = input_selection_1.get(input);
        var unformattedState = this.formatter.unformat({
            selection: selection,
            value: input.value,
        });
        input.value = unformattedState.value;
        input_selection_1.set(input, unformattedState.selection.start, unformattedState.selection.end);
    };
    BaseStrategy.prototype.prePasteEventHandler = function (event) {
        // without this, the paste event is called twice
        // so if you were pasting abc it would result in
        // abcabc
        event.preventDefault();
    };
    BaseStrategy.prototype.postPasteEventHandler = function () {
        this.reformatAfterPaste();
    };
    BaseStrategy.prototype.pasteEventHandler = function (event) {
        var splicedEntry;
        var entryValue = "";
        this.prePasteEventHandler(event);
        this.unformatInput();
        if (event.clipboardData) {
            entryValue = event.clipboardData.getData("Text");
        }
        else if (window.clipboardData) {
            entryValue = window.clipboardData.getData("Text");
        }
        var selection = input_selection_1.get(this.inputElement);
        splicedEntry = this.inputElement.value.split("");
        splicedEntry.splice(selection.start, selection.end - selection.start, entryValue);
        splicedEntry = splicedEntry.join("");
        if (this.onPasteEvent) {
            this.onPasteEvent({
                unformattedInputValue: splicedEntry,
            });
        }
        this.inputElement.value = splicedEntry;
        input_selection_1.set(this.inputElement, selection.start + entryValue.length, selection.start + entryValue.length);
        this.postPasteEventHandler();
    };
    BaseStrategy.prototype.reformatAfterPaste = function () {
        var event = document.createEvent("Event");
        this.reformatInput();
        event.initEvent("input", true, true);
        this.inputElement.dispatchEvent(event);
    };
    BaseStrategy.prototype.getStateToFormat = function () {
        var input = this.inputElement;
        var selection = input_selection_1.get(input);
        var stateToFormat = {
            selection: selection,
            value: input.value,
        };
        if (this.stateToFormat) {
            stateToFormat = this.stateToFormat;
            delete this.stateToFormat;
        }
        else if (selection.start === input.value.length && this.isFormatted) {
            stateToFormat = this.formatter.unformat(stateToFormat);
        }
        return stateToFormat;
    };
    return BaseStrategy;
}(strategy_interface_1.StrategyInterface));
exports.BaseStrategy = BaseStrategy;
