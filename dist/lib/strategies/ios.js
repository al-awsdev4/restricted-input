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
exports.IosStrategy = void 0;
var base_1 = require("./base");
var key_cannot_mutate_value_1 = require("../key-cannot-mutate-value");
var input_selection_1 = require("../input-selection");
var IosStrategy = /** @class */ (function (_super) {
    __extends(IosStrategy, _super);
    function IosStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IosStrategy.prototype.getUnformattedValue = function () {
        return _super.prototype.getUnformattedValue.call(this, true);
    };
    IosStrategy.prototype.attachListeners = function () {
        var _this = this;
        this.inputElement.addEventListener("keydown", function (event) {
            var isKeyboardEvent = event instanceof KeyboardEvent;
            if (!isKeyboardEvent && _this.inputElement.value.length > 0) {
                _this.stateToFormat = {
                    selection: { start: 0, end: 0 },
                    value: _this.inputElement.value,
                };
            }
            else if (_this.stateToFormat) {
                delete _this.stateToFormat;
            }
            _this.keydownListener(event);
        });
        this.inputElement.addEventListener("input", function (event) {
            var isCustomEvent = event instanceof CustomEvent;
            // Safari AutoFill fires CustomEvents
            // Set state to format before calling format listener
            if (isCustomEvent) {
                _this.stateToFormat = {
                    selection: { start: 0, end: 0 },
                    value: _this.inputElement.value,
                };
            }
            _this.formatListener();
            if (!isCustomEvent) {
                _this.fixLeadingBlankSpaceOnIos();
            }
        });
        this.inputElement.addEventListener("focus", function () {
            _this.formatListener();
        });
        this.inputElement.addEventListener("paste", function (event) {
            _this.pasteEventHandler(event);
        });
    };
    // When deleting the last character on iOS, the cursor
    // is positioned as if there is a blank space when there
    // is not, setting it to '' in a setTimeout fixes it ¯\_(ツ)_/¯
    IosStrategy.prototype.fixLeadingBlankSpaceOnIos = function () {
        var input = this.inputElement;
        if (input.value === "") {
            setTimeout(function () {
                input.value = "";
            }, 0);
        }
    };
    IosStrategy.prototype.formatListener = function () {
        if (this.isFormatted) {
            return;
        }
        var input = this.inputElement;
        var stateToFormat = this.getStateToFormat();
        var formattedState = this.formatter.format(stateToFormat);
        this.isFormatted = true;
        input.value = formattedState.value;
        input_selection_1.set(input, formattedState.selection.start, formattedState.selection.end);
    };
    IosStrategy.prototype.keydownListener = function (event) {
        if (key_cannot_mutate_value_1.keyCannotMutateValue(event)) {
            return;
        }
        if (this.isDeletion(event)) {
            this.stateToFormat = this.formatter.simulateDeletion({
                event: event,
                selection: input_selection_1.get(this.inputElement),
                value: this.inputElement.value,
            });
        }
        this.unformatInput();
    };
    return IosStrategy;
}(base_1.BaseStrategy));
exports.IosStrategy = IosStrategy;