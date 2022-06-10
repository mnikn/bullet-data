import { IconButton, MenuItem, Select } from '@mui/material';
import { SchemaFieldSelect } from 'models/schema';
import React from 'react';
import styled from 'styled-components';
import ClearIcon from '@mui/icons-material/Clear';
import {
  PRIMARY_COLOR1,
  PRIMARY_COLOR2,
  PRIMARY_COLOR2_LIGHT1,
  PRIMARY_COLOR2_LIGHT2,
} from '../../style';

const StyledInput = styled.div`
  @keyframes moveup {
    from {
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR2_LIGHT1};
    }
    to {
      top: -15px;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR1};
    }
  }

  @keyframes movedown {
    from {
      top: -25%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR1};
    }
    to {
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR2_LIGHT1};
    }
  }

  position: relative;
  display: flex;
  .input {
    background: ${PRIMARY_COLOR1};
    height: 50px;
    font-size: 16px;
    color: ${PRIMARY_COLOR2};
    font-weight: bold;
    width: 100%;
    border: none;
    border-radius: 32px;
    padding: 6px;
    padding-left: 12px;
    padding-right: 12px;
    outline: none;
    font-family: system-ui;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expand-btn {
    position: absolute;
    top: 50%;
    right: 5%;
    transform: translateY(-50%);
    color: ${PRIMARY_COLOR2_LIGHT1};
  }

  .label {
    position: absolute;
    overflow: hidden;
    top: 50%;
    left: 50%;
    width: 80%;
    text-align: center;
    user-select: none;
    pointer-events: none;
    transform: translateX(-50%) translateY(-50%);
    color: ${PRIMARY_COLOR2_LIGHT2};
    text-overflow: ellipsis;
  }

  .label.title {
    top: -15px;
    transform: translateX(-50%) translateY(-50%);
    color: ${PRIMARY_COLOR1};
    animation: 0.3s moveup;
    font-weight: bold;
  }

  .list {
    position: absolute;
    overflow: hidden;
    bottom: calc(-50% - 300px);
    left: 50%;
    width: 80%;
    height: 300px;
    text-align: center;
    transform: translateX(-50%);
    background: ${PRIMARY_COLOR1};
  }
`;

const FieldSelect = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldSelect;
  value: any;
  onValueChange?: (value: any) => void;
}) => {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  return (
    <StyledInput>
      <Select
        value={value}
        onChange={onChange}
        size="small"
        sx={{
          width: '100%',
          background: PRIMARY_COLOR1,
          height: '50px',
          border: 'none',
          borderRadius: '32px',
          fontWeight: 'bold',
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              marginTop: 2,
              background: PRIMARY_COLOR1,
              borderRadius: '32px',
            },
          },
        }}
      >
        {schema.config.options.map((item, i) => {
          return (
            <MenuItem key={i} value={item.value} sx={{ fontWeight: 'bold' }}>
              {item.label}
            </MenuItem>
          );
        })}
      </Select>
      <div className="label title">{label}</div>
      {schema.config.clearable && (
        <IconButton
          color="primary"
          onClick={() => {
            if (onValueChange) {
              onValueChange(null);
            }
          }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </StyledInput>
  );
};

export default FieldSelect;
