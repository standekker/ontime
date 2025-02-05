import React from 'react';
import { Box } from '@chakra-ui/layout';
import ErrorBoundary from '../../../common/components/errorBoundary/ErrorBoundary';
import MessageControl from './MessageControl';
import style from '../../editors/Editor.module.scss';
import { FiArrowUpRight } from '@react-icons/all-files/fi/FiArrowUpRight';
import { handleLinks } from '../../../common/utils/linkUtils';

export default function MessageControlExport() {
  return (
    <Box className={style.messages}>
      <h1>Messages Control</h1>
      <FiArrowUpRight className={style.corner} onClick={(event) => handleLinks(event, 'messagecontrol')} />
      <div className={style.content}>
        <ErrorBoundary>
          <MessageControl />
        </ErrorBoundary>
      </div>
    </Box>
  );
}
