import type { ConfigKey } from "@/types";
import { FieldRow } from "./widgets/FieldRow";
import { BooleanField } from "./widgets/BooleanField";
import { NumberField } from "./widgets/NumberField";
import { EnumField } from "./widgets/EnumField";
import { ColorField } from "./widgets/ColorField";
import { TextField } from "./widgets/TextField";
import { ThemePicker } from "./widgets/ThemePicker";
import { FontPicker } from "./widgets/FontPicker";
import { ListField } from "./widgets/ListField";
import { KeybindField } from "./widgets/KeybindField";

interface Props {
  def: ConfigKey;
  values: string[];
  isDirty: boolean;
  onChange: (values: string[]) => void;
}

export function FieldRenderer({ def, values, isDirty, onChange }: Props) {
  const first = values[0] ?? "";
  const defaultHint =
    def.defaults[0] !== undefined ? `default: ${def.defaults[0] || "(empty)"}` : undefined;

  return (
    <FieldRow def={def} isDirty={isDirty}>
      {renderWidget()}
      {defaultHint && (
        <div className="text-[11px] text-zinc-500 mt-1 font-mono">{defaultHint}</div>
      )}
    </FieldRow>
  );

  function setScalar(v: string) {
    onChange([v]);
  }

  function renderWidget() {
    switch (def.widget.kind) {
      case "bool":
        return <BooleanField value={first} onChange={setScalar} />;
      case "number":
        return <NumberField value={first} onChange={setScalar} />;
      case "color":
        return <ColorField value={first} onChange={setScalar} />;
      case "enum":
        return (
          <EnumField value={first} onChange={setScalar} values={def.widget.values} />
        );
      case "theme":
        return <ThemePicker value={first} onChange={setScalar} />;
      case "font-family":
        return <FontPicker value={first} onChange={setScalar} />;
      case "keybind":
        return <KeybindField values={values} onChange={onChange} />;
      case "list":
        return <ListField values={values} onChange={onChange} />;
      case "text":
      default:
        return <TextField value={first} onChange={setScalar} />;
    }
  }
}
