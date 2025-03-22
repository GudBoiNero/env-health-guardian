import { Button, Input, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
  fieldType?: "allergy" | "condition"; // Added field type prop
}

// Sample placeholders based on field type
const allergyExamples = [
  "e.g., Pollen",
  "e.g., Dust mites",
  "e.g., Pet dander",
  "e.g., Mold",
  "e.g., Food allergies",
  "e.g., Insect stings",
  "e.g., Medications",
  "e.g., Latex"
];

const conditionExamples = [
  "e.g., Asthma",
  "e.g., Eczema",
  "e.g., Diabetes",
  "e.g., Hypertension",
  "e.g., Arthritis",
  "e.g., Migraine",
  "e.g., Heart condition",
  "e.g., Respiratory issues"
];

export default function DynamicTextAreaList({ value = [""], onChange, fieldType = "allergy" }: Props) {
  // Choose example array based on field type
  const examples = fieldType === "allergy" ? allergyExamples : conditionExamples;
  
  // Make sure the values are properly passed as an array
  const handleChange = (index: number, newValue: string) => {
    const updatedEntries = [...value];
    updatedEntries[index] = newValue;
    // Filter out empty entries when saving to state
    onChange?.(updatedEntries.filter(entry => entry.trim() !== ""));
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
            placeholder={examples[index % examples.length]} // Use modulo to cycle through examples
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