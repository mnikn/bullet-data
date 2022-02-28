import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SchemaFieldSelect } from 'models/schema';

const FieldSelect = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldSelect;
  value: string;
  onValueChange?: (value: boolean) => void;
}) => {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        label={label || ''}
        onChange={onChange}
        size="small"
      >
        {schema.config.options.map((item, i) => {
          return (
            <MenuItem
              key={i}
              value={typeof item === 'object' ? item.value : item}
            >
              {typeof item === 'object' ? item.name : item}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default FieldSelect;
