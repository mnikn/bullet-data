import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { SchemaFieldBoolean } from 'models/schema';
import { PRIMARY_COLOR1 } from 'renderer/style';

const FieldBoolean = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldBoolean;
  value: boolean;
  onValueChange?: (value: boolean) => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center">
      {label && <div className="text-sm font-bold mb-5">{label}</div>}
      <input
        className="w-full accent-blue-300 outline-none cursor-pointer transition-all flex-shrink-0"
        style={{
          height: '16px',
        }}
        type="checkbox"
        checked={value}
        onChange={(e) => {
          if (onValueChange) {
            onValueChange(e.target.checked);
          }
        }}
      />
    </div>
  );
};

export default FieldBoolean;
