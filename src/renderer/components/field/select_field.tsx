import { SchemaFieldSelect } from 'models/schema';
import Select from 'react-select';
import classNames from 'classnames';

function FieldSelect({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
  label?: string;
  schema: SchemaFieldSelect;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e?.value || null);
    }
  };

  return (
    <div className={classNames('w-full flex flex-col items-center', className)}>
      {label && (
        <div className="text-md font-bold mb-2 text-zinc-900">{label}</div>
      )}
      <Select
        className="text-sm block outline-none cursor-pointer w-full"
        value={schema.config.options.find((d) => d.value === value)}
        onChange={onChange}
        options={schema.config.options}
        isClearable={schema.config.clearable}
        styles={{
          input: (provided) => ({
            ...provided,
            padding: '0 15px',
          }),
          control: (provided) => ({
            ...provided,
            outline: 'none',
            backgroundColor: '#fff',
            border: 'none',
            fontWeight: 'bold',
            '&:hover': {
              border: 'none',
            },
            cursor: 'pointer',
            borderRadius: 0,
          }),

          indicatorsContainer: (provided) => ({
            ...provided,
            flexGrow: 0,
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: '#52525b',
            width: '2px',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            color: '#52525b',
            '&:hover': {
              color: '#71717a',
            },
          }),
          menu: (provided) => ({
            ...provided,
            color: '#27272a',
            backgroundColor: '#f1f5f9',
          }),

          option: (provided, state) => ({
            ...provided,
            fontWeight: 'bold',
            backgroundColor: state.isSelected ? '#94a3b8' : '#f1f5f9',
            '&:hover': {
              backgroundColor: state.isSelected ? '#94a3b8' : '#fff',
            },
            cursor: 'pointer',
          }),
        }}
      />
    </div>
  );
}

export default FieldSelect;
