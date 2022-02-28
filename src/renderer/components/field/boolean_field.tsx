import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import {
  SchemaFieldBoolean
} from 'models/schema';

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
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.checked);
    }
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={value} />}
        label={label || ''}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default FieldBoolean;
