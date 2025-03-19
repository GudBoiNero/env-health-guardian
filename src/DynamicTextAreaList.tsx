import { Button, Input, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export default function DynamicTextAreaList({ value = [""], onChange }: Props) {
  const handleChange = (index: number, newValue: string) => {
    const updatedEntries = [...value];
    updatedEntries[index] = newValue;
    onChange?.(updatedEntries);
  };

  const handleAdd = () => {
    onChange?.([...value, ""]); // Append a new empty entry
  };

  const handleRemove = (index: number) => {
    if (value.length > 1) {
      onChange?.(value.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {value.map((entry, index) => (
        <Space key={index}>
          <Input.TextArea
            value={entry}
            onChange={(e) => handleChange(index, e.target.value)}
            autoSize={{ minRows: 1 }}
            placeholder={`${index + 1}`}
            style={{ width: "100%" }} // Ensure full width
          />
          {value.length > 1 && (
            <Button type="text" danger onClick={() => handleRemove(index)} icon={<DeleteOutlined />} />
          )}
        </Space>
      ))}

      {/* Plus button at the bottom */}
      <Button type="dashed" onClick={handleAdd} icon={<PlusOutlined />} style={{ width: "100%" }}>
        Add Entry
      </Button>
    </div>
  );
}
