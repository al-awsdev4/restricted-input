import { StrategyInterface, StrategyOptions } from "./strategy-interface";
import { PatternFormatter as Formatter, FormatMetadata } from "../formatter";
declare global {
    interface Window {
        clipboardData: {
            getData: (text: string) => string;
        };
    }
}
export declare class BaseStrategy extends StrategyInterface {
    formatter: Formatter;
    private onPasteEvent?;
    protected stateToFormat?: FormatMetadata;
    constructor(options: StrategyOptions);
    getUnformattedValue(forceUnformat?: boolean): string;
    private formatIfNotEmpty;
    setPattern(pattern: string): void;
    protected attachListeners(): void;
    protected isDeletion(event: KeyboardEvent): boolean;
    protected reformatInput(): void;
    protected afterReformatInput(formattedState: FormatMetadata): void;
    protected unformatInput(): void;
    protected prePasteEventHandler(event: ClipboardEvent): void;
    protected postPasteEventHandler(): void;
    protected pasteEventHandler(event: ClipboardEvent): void;
    protected reformatAfterPaste(): void;
    protected getStateToFormat(): FormatMetadata;
}
