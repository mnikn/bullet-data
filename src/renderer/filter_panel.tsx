import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  Select,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import {
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import StringField from './components/field/string_field';
import NumberField from './components/field/number_field';
import SelectField from './components/field/select_field';
import Context from './context';
import { PRIMARY_COLOR1, PRIMARY_COLOR2 } from './style';

function findChildSchema(
  schema: SchemaField | null,
  prop: string
): SchemaField | null {
  if (schema instanceof SchemaFieldObject) {
    const propArr = prop.split('.');

    const directChild = schema.fields.find((f) => {
      return f.id === propArr[0];
    });
    if (directChild) {
      return findChildSchema(directChild.data, prop);
    } else {
      return null;
    }
  } else if (schema instanceof SchemaFieldArray) {
    return schema.fieldSchema;
  } else {
    return schema;
  }
}

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <Button sx={{ borderRadius: '0' }} variant="contained" {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  marginRight: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const CollapseCard = ({
  children,
  initialExpand = true,
}: {
  children: ReactNode;
  initialExpand: boolean;
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpand);
  const handleExpandClick = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  return (
    <Stack>
      <Card
        style={{
          width: '100%',
          marginTop: expanded ? '10px' : '0px',
          background: PRIMARY_COLOR1,
          clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}
      >
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ padding: '10px!important' }}>
            {children}
          </CardContent>
        </Collapse>
      </Card>
      <ExpandMore expand={expanded} onClick={handleExpandClick}>
        <ExpandMoreIcon />
      </ExpandMore>
    </Stack>
  );
};

const FilterPanel = ({
  onFilterChange,
}: {
  onFilterChange?: (value: any) => void;
}) => {
  const [filterValue, setFilterValues] = useState<any>({});

  const { schemaConfig, schema } = useContext(Context);

  const [filterConfig, setFilterConfig] = useState<any[]>([]);

  useLayoutEffect(() => {
    setFilterConfig(
      (schemaConfig?.filters || []).map((item: any) => {
        const originSchema = findChildSchema(schema, item.prop);
        let fieldSchema = null;
        let filterSchema = null;
        if (originSchema) {
          if (originSchema.type === 'string') {
            fieldSchema = new SchemaFieldString();
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Include',
                  value: 'include',
                },
                {
                  label: 'Exclude',
                  value: 'exclude',
                },
                {
                  label: 'Equal',
                  value: 'equal',
                },
              ],
            });
          } else if (originSchema.type === 'number') {
            fieldSchema = new SchemaFieldNumber();
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Less',
                  value: 'less',
                },
                {
                  label: 'Less equal',
                  value: 'less_equal',
                },
                {
                  label: 'Bigger',
                  value: 'bigger',
                },
                {
                  label: 'Bigger equal',
                  value: 'bigger_equal',
                },
                {
                  label: 'Equal',
                  value: 'equal',
                },
              ],
            });
          } else if (originSchema.type === 'select') {
            fieldSchema = new SchemaFieldSelect();
            fieldSchema.setup({
              clearable: true,
            });
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Exists',
                  value: 'exists',
                },
                {
                  label: 'Not exists',
                  value: 'not_exists',
                },
              ],
            });
          }
        }
        return {
          ...item,
          schema: fieldSchema,
          filterSchema: filterSchema,
        };
      })
    );
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  }, [filterValue]);

  return (
    <div
      style={{
        position: 'fixed',
        width: '100%',
        zIndex: 5,
      }}
    >
      <CollapseCard initialExpand={false}>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            alignItems: 'center',
            clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
            padding: '30px',
            paddingLeft: '5%',
            paddingRight: '5%',
            background: PRIMARY_COLOR2,
            color: PRIMARY_COLOR1,
          }}
        >
          <Grid container spacing={4} direction="row">
            {(filterConfig || [])
              .filter((item: any) => !!item.schema)
              .map((item: any, i: number) => {
                return (
                  <Grid item xs={4} key={i}>
                    {item.schema instanceof SchemaFieldString && (
                      <Stack
                        spacing={1}
                        direction="row"
                        sx={{
                          '*:last-child': {
                            flexGrow: 1,
                          },
                        }}
                      >
                        <SelectField
                          schema={item.filterSchema}
                          value={
                            filterValue?.[item.prop]?.filterType ||
                            item.filterSchema.config.options[0]?.value
                          }
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  ...prev[item.prop],
                                  filterType: v,
                                },
                              };
                            });
                          }}
                        />
                        <StringField
                          schema={item.schema}
                          value={filterValue?.[item.prop]?.value}
                          label={item.label}
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  value: v,
                                  filterType:
                                    prev[item.prop]?.filterType ||
                                    item.filterSchema.config.options[0]?.value,
                                  schema: item.schema,
                                },
                              };
                            });
                          }}
                        />
                      </Stack>
                    )}
                    {item.schema instanceof SchemaFieldNumber && (
                      <Stack
                        spacing={1}
                        direction="row"
                        sx={{
                          '*:last-child': {
                            flexGrow: 1,
                          },
                        }}
                      >
                        <SelectField
                          schema={item.filterSchema}
                          value={
                            filterValue?.[item.prop]?.filterType ||
                            item.filterSchema.config.options[0]?.value
                          }
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  ...prev[item.prop],
                                  filterType: v,
                                },
                              };
                            });
                          }}
                        />
                        <NumberField
                          schema={item.schema}
                          value={filterValue?.[item.prop]?.value}
                          label={item.label}
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  value: v,
                                  filterType:
                                    prev[item.prop]?.filterType ||
                                    item.filterSchema.config.options[0]?.value,
                                  schema: item.schema,
                                },
                              };
                            });
                          }}
                        />
                      </Stack>
                    )}
                    {item.schema instanceof SchemaFieldSelect && (
                      <Stack
                        spacing={1}
                        direction="row"
                        sx={{
                          '*:last-child': {
                            flexGrow: 1,
                          },
                        }}
                      >
                        <SelectField
                          schema={item.filterSchema}
                          value={
                            typeof filterValue[item.prop]?.filterType !==
                            'undefined'
                              ? filterValue[item.prop]?.filterType
                              : item.filterSchema.config.options[0]?.value
                          }
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  ...prev[item.prop],
                                  filterType: v,
                                },
                              };
                            });
                          }}
                        />
                        <SelectField
                          schema={item.schema}
                          value={filterValue?.[item.prop]?.value}
                          label={item.label}
                          onValueChange={(v) => {
                            setFilterValues((prev: any) => {
                              return {
                                ...prev,
                                [item.prop]: {
                                  value: v,
                                  filterType:
                                    prev[item.prop]?.filterType ||
                                    item.filterSchema.config.options[0]?.value,
                                  schema: item.schema,
                                },
                              };
                            });
                          }}
                        />
                      </Stack>
                    )}
                  </Grid>
                );
              })}
          </Grid>
        </Stack>
      </CollapseCard>
    </div>
  );
};

export default FilterPanel;
