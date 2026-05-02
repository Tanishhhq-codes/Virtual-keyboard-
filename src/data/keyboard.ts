export interface KeyData {
  label: string;
  code: string;
  width?: number; // in rem units, default is 2.75
  color?: "default" | "modifier" | "accent" | "nav" | "special";
}

export type KeyboardRow = KeyData[];

export const keyboardLayout: KeyboardRow[] = [
  // Row 0 - Function keys
  [
    { label: "ESC", code: "Escape", width: 2.75, color: "special" },
    { label: "F1", code: "F1", width: 2.25 },
    { label: "F2", code: "F2", width: 2.25 },
    { label: "F3", code: "F3", width: 2.25 },
    { label: "F4", code: "F4", width: 2.25 },
    { label: "F5", code: "F5", width: 2.25 },
    { label: "F6", code: "F6", width: 2.25 },
    { label: "F7", code: "F7", width: 2.25 },
    { label: "F8", code: "F8", width: 2.25 },
    { label: "F9", code: "F9", width: 2.25 },
    { label: "F10", code: "F10", width: 2.25 },
    { label: "F11", code: "F11", width: 2.25 },
    { label: "F12", code: "F12", width: 2.25 },
    { label: "PRTSC", code: "PrintScreen", width: 2.75, color: "accent" },
    { label: "PAUSE", code: "Pause", width: 2.75, color: "accent" },
    { label: "DEL", code: "Delete", width: 2.75, color: "accent" },
  ],
  // Row 1 - Number row
  [
    { label: "~\n`", code: "Backquote" },
    { label: "!\n1", code: "Digit1" },
    { label: "@\n2", code: "Digit2" },
    { label: "#\n3", code: "Digit3" },
    { label: "$\n4", code: "Digit4" },
    { label: "%\n5", code: "Digit5" },
    { label: "^\n6", code: "Digit6" },
    { label: "&\n7", code: "Digit7" },
    { label: "*\n8", code: "Digit8" },
    { label: "(\n9", code: "Digit9" },
    { label: ")\n0", code: "Digit0" },
    { label: "_\n-", code: "Minus" },
    { label: "+\n=", code: "Equal" },
    { label: "BACKSPACE", code: "Backspace", width: 5.25, color: "accent" },
    { label: "PGUP", code: "PageUp", width: 2.75, color: "accent" },
  ],
  // Row 2 - QWERTY row
  [
    { label: "TAB", code: "Tab", width: 3.75, color: "modifier" },
    { label: "Q", code: "KeyQ" },
    { label: "W", code: "KeyW" },
    { label: "E", code: "KeyE" },
    { label: "R", code: "KeyR" },
    { label: "T", code: "KeyT" },
    { label: "Y", code: "KeyY" },
    { label: "U", code: "KeyU" },
    { label: "I", code: "KeyI" },
    { label: "O", code: "KeyO" },
    { label: "P", code: "KeyP" },
    { label: "{\n[", code: "BracketLeft" },
    { label: "}\n]", code: "BracketRight" },
    { label: "|\n\\", code: "Backslash", width: 3.25 },
    { label: "PGDN", code: "PageDown", width: 2.75, color: "accent" },
  ],
  // Row 3 - Home row
  [
    { label: "CAPS LOCK", code: "CapsLock", width: 4.25, color: "modifier" },
    { label: "A", code: "KeyA" },
    { label: "S", code: "KeyS" },
    { label: "D", code: "KeyD" },
    { label: "F", code: "KeyF" },
    { label: "G", code: "KeyG" },
    { label: "H", code: "KeyH" },
    { label: "J", code: "KeyJ" },
    { label: "K", code: "KeyK" },
    { label: "L", code: "KeyL" },
    { label: ":\n;", code: "Semicolon" },
    { label: "\"\n'", code: "Quote" },
    { label: "ENTER", code: "Enter", width: 5.75, color: "accent" },
    { label: "HOME", code: "Home", width: 2.75, color: "accent" },
  ],
  // Row 4 - Bottom row
  [
    { label: "SHIFT", code: "ShiftLeft", width: 5.5, color: "modifier" },
    { label: "Z", code: "KeyZ" },
    { label: "X", code: "KeyX" },
    { label: "C", code: "KeyC" },
    { label: "V", code: "KeyV" },
    { label: "B", code: "KeyB" },
    { label: "N", code: "KeyN" },
    { label: "M", code: "KeyM" },
    { label: "<\n,", code: "Comma" },
    { label: ">\n.", code: "Period" },
    { label: "?\n/", code: "Slash" },
    { label: "SHIFT", code: "ShiftRight", width: 3.25, color: "modifier" },
    { label: "↑", code: "ArrowUp", width: 2.75, color: "nav" },
    { label: "END", code: "End", width: 2.75, color: "accent" },
  ],
  // Row 5 - Space row
  [
    { label: "CTRL", code: "ControlLeft", width: 3, color: "modifier" },
    { label: "ALT", code: "AltLeft", width: 2.75, color: "modifier" },
    { label: "CMD", code: "MetaLeft", width: 3, color: "modifier" },
    { label: "", code: "Space", width: 15.75 },
    { label: "ALT", code: "AltRight", width: 2.75, color: "modifier" },
    { label: "CTRL", code: "ControlRight", width: 2.75, color: "modifier" },
    { label: "←", code: "ArrowLeft", width: 2.75, color: "nav" },
    { label: "↓", code: "ArrowDown", width: 2.75, color: "nav" },
    { label: "→", code: "ArrowRight", width: 2.75, color: "nav" },
  ],
];
