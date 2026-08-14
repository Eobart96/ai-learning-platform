import { useState } from "react";

const slovakKeys = ["á", "ä", "č", "ď", "é", "í", "ĺ", "ľ", "ň", "ó", "ô", "ŕ", "š", "ť", "ú", "ý", "ž", "ch", "dz", "dž"];

type SlovakKeyboardProps = { onInsert: (key: string) => void; disabled?: boolean };

export function SlovakKeyboard({ onInsert, disabled = false }: SlovakKeyboardProps) {
  const [capsLock, setCapsLock] = useState(false);
  return <div className="native-keyboard" aria-label="Словацкие буквы">
    <button className={`native-keyboard-caps ${capsLock ? "active" : ""}`} type="button" aria-pressed={capsLock} onClick={() => setCapsLock((value) => !value)} disabled={disabled}>Caps Lock</button>
    {slovakKeys.map((key) => <button key={key} type="button" onClick={(event) => onInsert(event.shiftKey || capsLock ? key.toUpperCase() : key)} disabled={disabled}>{capsLock ? key.toUpperCase() : key}</button>)}
  </div>;
}
