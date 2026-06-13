"use client";

import { useState } from "react";

interface CustomFieldsProps {
  fields: string[];
  onFieldsChange: (fields: string[]) => void;
}

export function CustomFields({ fields, onFieldsChange }: CustomFieldsProps) {
  const [input, setInput] = useState("");

  const addField = () => {
    if (input.trim()) {
      onFieldsChange([...fields, input.trim()]);
      setInput("");
    }
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addField();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añade un campo a extraer..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addField}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Añadir
        </button>
      </div>

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{field}</span>
              <button
                onClick={() => removeField(index)}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
