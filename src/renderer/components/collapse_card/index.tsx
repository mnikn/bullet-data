import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import style from 'styled-components';
import { useState } from 'react';
import { PRIMARY_COLOR1, PRIMARY_COLOR2 } from '../../style';

const StyledCard = style.div<{ expand: boolean }>`
  clip-path: polygon(0px 25px, 50px 0px, calc(60% - 25px) 0px, 60% 25px, 100% 25px, 100% calc(100% - 10px), calc(100% - 15px) calc(100% - 10px), calc(80% - 10px) calc(100% - 10px), calc(80% - 15px) 100%, 80px calc(100% - 0px), 65px calc(100% - 15px), 0% calc(100% - 15px));
  width: 100%;
  background: ${PRIMARY_COLOR1}!important;
  position: relative;
  color: ${PRIMARY_COLOR1}!important;
  flex-grow: 1;
    padding: 30px;

  .bg {
    position: absolute;
    background: ${PRIMARY_COLOR2};
  clip-path: polygon(0px 25px, 50px 0px, calc(60% - 25px) 0px, 60% 25px, 100% 25px, 100% calc(100% - 10px), calc(100% - 15px) calc(100% - 10px), calc(80% - 10px) calc(100% - 10px), calc(80% - 15px) 100%, 80px calc(100% - 0px), 65px calc(100% - 15px), 0% calc(100% - 15px));
    z-index: -2;
  }

  .header {
    display: flex;
    flex-direction: row;
    color: ${PRIMARY_COLOR2};
    padding-top: 25px;
    padding-left: 20px;
    .btn-group {
      margin-left: auto;
    }
    .summary {
      color: ${PRIMARY_COLOR1};
      font-size: 18px;
      font-weight: bold;
      z-index: 1;
    }
  }

 .icon {
    color: #FFF305;
  }
`;

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

const CollapseCard = ({
  children,
  title = '',
  initialExpand = true,
}: {
  children: ReactNode;
  title: string;
  initialExpand: boolean;
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpand);
  const handleExpandClick = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  return (
    <StyledCard expand={expanded}>
      <div
        className="bg"
        style={{
          height: expanded ? 'calc(100% - 40px)' : '70%',
        }}
      />
      <div className="header">
        <div className="summary">{title}</div>
        <div className="btn-group">
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            color="primary"
          >
            <ExpandMoreIcon className="icon" />
          </ExpandMore>
        </div>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{children}</CardContent>
      </Collapse>
    </StyledCard>
  );
};

export default CollapseCard;
