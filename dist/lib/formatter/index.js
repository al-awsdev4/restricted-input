"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternFormatter = void 0;
var parse_pattern_1 = require("./parse-pattern");
var is_backspace_1 = require("../is-backspace");
var PatternFormatter = /** @class */ (function () {
    function PatternFormatter(pattern) {
        this.pattern = parse_pattern_1.parsePattern(pattern);
    }
    PatternFormatter.prototype.format = function (options) {
        var originalString = options.value;
        var originalStringIndex = 0;
        var formattedString = "";
        var selection = {
            start: options.selection.start,
            end: options.selection.end,
        };
        for (var i = 0; i < this.pattern.length; i++) {
            var patternChar = this.pattern[i];
            var inputChar = originalString[originalStringIndex];
            if (originalStringIndex > originalString.length) {
                break;
            }
            if (typeof patternChar.value === "string") {
                if (inputChar != null || formattedString.length === patternChar.index) {
                    formattedString += patternChar.value;
                    if (patternChar.index <= selection.start) {
                        selection.start++;
                    }
                    if (patternChar.index <= selection.end) {
                        selection.end++;
                    }
                }
            }
            else {
                // User input char
                // prettier-ignore
                for (; originalStringIndex < originalString.length; originalStringIndex++) {
                    inputChar = originalString[originalStringIndex];
                    if (patternChar.value.test(inputChar)) {
                        formattedString += inputChar;
                        originalStringIndex++;
                        break;
                    }
                    else {
                        if (patternChar.index <= selection.start) {
                            selection.start--;
                        }
                        if (patternChar.index <= selection.end) {
                            selection.end--;
                        }
                    }
                }
            }
        }
        return {
            value: formattedString,
            selection: selection,
        };
    };
    PatternFormatter.prototype.unformat = function (options) {
        var start = options.selection.start;
        var end = options.selection.end;
        var unformattedString = "";
        for (var i = 0; i < this.pattern.length; i++) {
            var patternChar = this.pattern[i];
            if (typeof patternChar.value !== "string" &&
                options.value[i] != null &&
                patternChar.value.test(options.value[i])) {
                unformattedString += options.value[i];
                continue;
            }
            if (patternChar.value !== options.value[patternChar.index]) {
                continue;
            }
            if (patternChar.index < options.selection.start) {
                start--;
            }
            if (patternChar.index < options.selection.end) {
                end--;
            }
        }
        return {
            selection: {
                start: start,
                end: end,
            },
            value: unformattedString,
        };
    };
    PatternFormatter.prototype.simulateDeletion = function (options) {
        var deletionStart, deletionEnd;
        var state = this.unformat(options);
        var value = state.value;
        var selection = state.selection;
        var delta = Math.abs(state.selection.end - state.selection.start);
        if (delta) {
            deletionStart = selection.start;
            deletionEnd = selection.end;
        }
        else if (is_backspace_1.isBackspace(options.event)) {
            deletionStart = Math.max(0, selection.start - 1);
            deletionEnd = selection.start;
        }
        else {
            // Handle forward delete
            deletionStart = selection.start;
            deletionEnd = Math.min(value.length, selection.start + 1);
        }
        return {
            selection: {
                start: deletionStart,
                end: deletionStart,
            },
            value: value.substr(0, deletionStart) + value.substr(deletionEnd),
        };
    };
    return PatternFormatter;
}());
exports.PatternFormatter = PatternFormatter;
