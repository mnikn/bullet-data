import { CardContent, Collapse } from '@mui/material';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';

const CollapseCard = ({
  children,
  title = '',
  initialExpand = true,
  className,
}: {
  children: ReactNode;
  title: string;
  initialExpand: boolean;
  className?: string;
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpand);
  const handleExpandClick = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  return (
    <div
      className={classNames(
        'flex flex-col bg-slate-400 w-full p-5 border-r-4 border-b-4 border-t-2 border-l-2 border-zinc-900',
        className
      )}
    >
      <div className="flex items-center">
        <div className="font-bold text-lg text-zinc-900">{title}</div>
        <div className="flex items-center ml-auto">
          {!expanded && (
            <RiArrowDownSLine
              className={ACITON_ICON_CLASS}
              onClick={handleExpandClick}
            />
          )}
          {expanded && (
            <RiArrowUpSLine
              className={ACITON_ICON_CLASS}
              onClick={handleExpandClick}
            />
          )}
        </div>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{children}</CardContent>
      </Collapse>
    </div>
  );
};

export default CollapseCard;
