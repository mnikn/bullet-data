import { ReactNode, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  Collapse,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Stack,
  FormLabel,
  Grid,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <Button variant="contained" {...other} />;
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
        }}
      >
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>{children}</CardContent>
        </Collapse>
      </Card>
      <ExpandMore expand={expanded} onClick={handleExpandClick}>
        <ExpandMoreIcon />
      </ExpandMore>
    </Stack>
  );
};

const FilterPanel = ({
  onFiltersChange,
}: {
  onFiltersChange?: (values) => void;
}) => {
  const [filters, setFilters] = useState<
    {
      label: string;
      prop: string;
    }[]
  >([]);

  useEffect(() => {
    setFilters([
      {
        label: 'id',
        prop: 'id',
      },
      {
        label: 'content',
        prop: 'sub.content',
      },
    ]);
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        width: '50%',
        transform: 'translateX(50%)',
        zIndex: 5,
      }}
    >
      <CollapseCard initialExpand={false}>
        <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
          <FormLabel>Filters:</FormLabel>
          <Grid container spacing={2} direction="row">
            {/* <Grid item xs={6}>
                <FormControl fullWidth>
                <InputLabel id="select-label">Id</InputLabel>
                <Select
                labelId="select-label"
                id="select"
                label="id"
                size="small"
                >
                <MenuItem>sas</MenuItem>
                </Select>
                </FormControl>
                </Grid> */}

            {filters.map((item) => {
              return (
                <Grid item xs={6}>
                  <TextField size="small" label={item.label} />
                </Grid>
              );
            })}

            {/* <Grid item xs={6}>
                <TextField size="small" label="ss" type="number" />
                </Grid> */}
          </Grid>
        </Stack>
      </CollapseCard>
    </div>
  );
};

export default FilterPanel;
