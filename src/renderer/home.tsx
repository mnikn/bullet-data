import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Menu,
  MenuItem,
  Collapse,
  Fab,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FieldContainer } from './field';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldString,
  SchemaFieldType,
} from 'models/schema';
import SchemaConfig from './schema_config';

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  marginRight: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const schemaJson = {
  type: 'object',
  fields: {
    name: {
      name: 'name',
      type: 'string',
      config: {},
    },
    content: {
      name: 'content',
      type: 'string',
      config: {
        type: 'multiline',
        defaultValue: 'dsd',
        colSpan: 6,
      },
    },
    arr: {
      name: 'arr',
      type: 'array',
      fieldSchema: {
        type: 'string',
        config: {},
      },
      config: {},
    },
  },
};

function buildSchema(json: any): SchemaField {
  switch (json.type) {
    case SchemaFieldType.Object: {
      const instance = new SchemaFieldObject();
      instance.setup(json.config);
      instance.config.defaultValue = {};
      instance.fields = Object.keys(json.fields).map((key: string) => {
        const data: any = {
          type: json.fields[key].type,
          config: json.fields[key].config,
        };
        if (json.fields[key].type === SchemaFieldType.Array) {
          data.fieldSchema = json.fields[key].fieldSchema;
        }
        const subfield = buildSchema(data);
        instance.config.defaultValue[key] = subfield.config.defaultValue;
        return {
          id: key,
          name: json.fields[key].name,
          data: subfield,
        };
      });
      return instance;
    }
    case SchemaFieldType.Array: {
      const instance = new SchemaFieldArray(
        buildSchema({
          type: json.fieldSchema.type,
          config: json.fieldSchema.config,
        })
      );
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.String: {
      const instance = new SchemaFieldString();
      instance.setup(json.config);
      return instance;
    }
  }
  return new SchemaFieldObject();
}

console.log(buildSchema(schemaJson));

const Item = ({
  schema,
  value,
  onValueChange,
  onDelete,
}: {
  schema: SchemaField;
  value: any;
  onValueChange?: (v: any) => void;
  onDelete: () => void;
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const settingsMenuOpen = Boolean(anchorEl);
  const handleExpandClick = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card>
      <CardHeader
        action={
          <>
            <IconButton aria-label="settings" onClick={handleSettingsClick}>
              <MoreVertIcon />
            </IconButton>
            <ExpandMore expand={expanded} onClick={handleExpandClick}>
              <ExpandMoreIcon />
            </ExpandMore>
          </>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <FieldContainer
            schema={schema}
            value={value}
            onValueChange={onValueChange}
          />
        </CardContent>
      </Collapse>
      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={settingsMenuOpen}
        onClose={handleSettingsClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            onDelete();
            handleSettingsClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Home = () => {
  const [list, setList] = useState<SchemaField[]>([]);
  const [valueList, setValueList] = useState<any[]>([]);
  const [schemaConfigOpen, setSchemaConfigOpen] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState({
    type: 'object',
    fields: {},
  });

  const [schema, setSchema] = useState<SchemaField>(new SchemaFieldObject());

  const onItemChange = (v: any, i: number) => {
    setValueList((prev) => {
      return prev.map((item, j) => (j === i ? v : item));
    });
  };
  const onItemDelete = (i: number) => {
    setList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
    setValueList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
  };

  const onSchemaConfigSubmit = (v: any) => {
    setSchemaConfig(v);
  };

  useEffect(() => {
    setSchema(buildSchema(schemaConfig));
  }, [schemaConfig]);

  useEffect(() => {
    console.log('value: ', valueList);
  }, [valueList]);

  return (
    <div
      style={{
        backgroundColor: '#e7ebf0',
        padding: '20px',
      }}
    >
      <Stack spacing={2}>
        <Button
          style={{ width: '240px', marginLeft: 'auto' }}
          variant="contained"
          onClick={() => {
            setSchemaConfigOpen(true);
          }}
        >
          Schema Config
        </Button>
        {list.map((item, i) => {
          return (
            <Item
              key={i}
              schema={item}
              value={valueList[i]}
              onValueChange={(v) => onItemChange(v, i)}
              onDelete={() => onItemDelete(i)}
            />
          );
        })}
      </Stack>

      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
        color="primary"
        onClick={() => {
          setList((prev) => {
            setValueList((prevArr) => {
              return prevArr.concat(schema.config.defaultValue);
            });
            return prev.concat(schema);
          });
        }}
      >
        <AddIcon />
      </Fab>

      {schemaConfigOpen && (
        <SchemaConfig
          initialValue={schemaConfig}
          onSubmit={onSchemaConfigSubmit}
          close={() => {
            setSchemaConfigOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
