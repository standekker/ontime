import React, { memo } from 'react';
import Countdown from 'common/components/countdown/Countdown';
import { Tooltip } from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import PropTypes from 'prop-types';
import { stringFromMillis } from '../../../common/utils/time';
import style from './PlaybackControl.module.scss';

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.timer.running === nextProps.timer.running &&
    prevProps.timer.isNegative === nextProps.timer.isNegative &&
    prevProps.timer.expectedFinish === nextProps.timer.expectedFinish &&
    prevProps.timer.startedAt === nextProps.timer.startedAt &&
    prevProps.playback === nextProps.playback &&
    prevProps.timer.secondary === nextProps.timer.secondary &&
    prevProps.selectedId === nextProps.selectedId
  );
};

const incrementProps = {
  size: 'sm',
  width: '2.9em',
  colorScheme: 'white',
  variant: 'outline',
};

const PlaybackTimer = (props) => {
  const { timer, playback, handleIncrement, selectedId } = props;
  const started = stringFromMillis(timer.startedAt, true);
  const finish = stringFromMillis(timer.expectedFinish, true);
  const isRolling = playback === 'roll';
  const isWaiting = timer.secondary > 0 && timer.running == null;
  const disableButtons = selectedId == null || isRolling;

  return (
    <div className={style.timeContainer}>
      <div className={style.indicators}>
        <Tooltip label='Roll mode active'>
          <div className={isRolling ? style.indRollActive : style.indRoll} />
        </Tooltip>
        <div className={timer.isNegative ? style.indNegativeActive : style.indNegative} />
        <div className={style.indDelay} />
      </div>
      <div className={style.timer}>
        <Countdown
          time={isWaiting ? timer.secondary : timer.running}
          isNegative={timer.isNegative}
          small
        />
      </div>
      {isWaiting ? (
        <div className={style.roll}>
          <span className={style.rolltag}>Roll: Countdown to start</span>
          <span className={style.time}>FIX</span>
        </div>
      ) : (
        <>
          <div className={style.start}>
            <span className={style.tag}>Started at </span>
            <span className={style.time}>{started}</span>
          </div>
          <div className={style.finish}>
            <span className={style.tag}>Finish at </span>
            <span className={style.time}>{finish}</span>
          </div>
        </>
      )}
      <div className={style.btn}>
        <Tooltip label='Remove 1 minute' openDelay={500} shouldWrapChildren={disableButtons}>
          <Button
            {...incrementProps}
            disabled={disableButtons}
            onClick={() => handleIncrement(-1)}
            _hover={!disableButtons && { bg: '#ebedf0', color: '#333' }}
          >
            -1
          </Button>
        </Tooltip>
        <Tooltip label='Add 1 minute' openDelay={500} shouldWrapChildren={disableButtons}>
          <Button
            {...incrementProps}
            disabled={disableButtons}
            onClick={() => handleIncrement(1)}
            _hover={!disableButtons && { bg: '#ebedf0', color: '#333' }}
          >
            +1
          </Button>
        </Tooltip>
        <Tooltip label='Remove 5 minutes' openDelay={500} shouldWrapChildren={disableButtons}>
          <Button
            {...incrementProps}
            disabled={disableButtons}
            onClick={() => handleIncrement(-5)}
            _hover={!disableButtons && { bg: '#ebedf0', color: '#333' }}
          >
            -5
          </Button>
        </Tooltip>
        <Tooltip label='Add 5 minutes' openDelay={500} shouldWrapChildren={disableButtons}>
          <Button
            {...incrementProps}
            disabled={disableButtons}
            onClick={() => handleIncrement(5)}
            _hover={!disableButtons && { bg: '#ebedf0', color: '#333' }}
          >
            +5
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default memo(PlaybackTimer, areEqual);

PlaybackTimer.propTypes = {
  timer: PropTypes.object.isRequired,
  playback: PropTypes.string,
  handleIncrement: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
};
