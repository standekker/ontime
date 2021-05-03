import style from './PlaybackControl.module.css';
import Countdown from '../../common/components/countdown/Countdown';
import { stringFromMillis } from '../../common/dateConfig';
import { useEffect, useState } from 'react';
import { useSocket } from '../../app/context/socketContext';
import { Button } from '@chakra-ui/button';
import PlaybackButtons from './PlaybackButtons';

export default function PlaybackControl() {
  const socket = useSocket();
  const [playback, setPlayback] = useState(null);
  const [timer, setTimer] = useState({
    clock: null,
    running: null,
    currentSeconds: null,
    startedAt: null,
    expectedFinish: null,
  });
  const [selectedId, setSelectedId] = useState(null);

  const resetTimer = () => {
    setTimer({
      currentSeconds: null,
      startedAt: null,
      expectedFinish: null,
    });
  };

  // handle incoming messages
  useEffect(() => {
    if (socket == null) return;

    socket.emit('get-timer');
    socket.emit('get-playstate');
    socket.emit('get-selected-id');

    // Handle playstate
    socket.on('playstate', (data) => {
      setPlayback(data);
    });

    // Handle timer
    socket.on('timer', (data) => {
      setTimer({ ...data });
    });

    // Handle selected event
    socket.on('selected-id', (data) => {
      setSelectedId(data);
    });

    // Clear listener
    return () => {
      socket.off('playstate');
      socket.off('timer');
      socket.off('selected-id');
    };
  }, [socket]);

  const playbackControl = async (action, payload) => {
    switch (action) {
      case 'start':
        socket.emit('set-playstate', 'start');
        break;
      case 'pause':
        socket.emit('set-playstate', 'pause');
        break;
      case 'roll':
        socket.emit('set-playstate', 'roll');
        break;
      case 'previous':
        socket.emit('set-playstate', 'previous');
        resetTimer();
        break;
      case 'next':
        socket.emit('set-playstate', 'next');
        resetTimer();
        break;
      case 'unload':
        socket.emit('set-playstate', 'unload');
        resetTimer();
        break;
      case 'reload':
        socket.emit('set-playstate', 'reload');
        resetTimer();
        break;
      default:
        break;
    }
  };

  const started = stringFromMillis(timer.startedAt, true);
  const finish = stringFromMillis(timer.expectedFinish, true);
  const isNegative = timer.running < 0;
  const isDelayed = false;
  const isRolling = false;

  const incrementProps = {
    size: 'sm',
    width: '2.9em',
    colorScheme: 'whiteAlpha',
    variant: 'outline',
    _focus: { boxShadow: 'none' },
  };

  console.log('debug timer', timer.running);
  return (
    <div className={style.mainContainer}>
      <div className={style.timeContainer}>
        <div className={style.indicators}>
          <div className={style.indRoll} />
          <div
            className={isNegative ? style.indNegativeActive : style.indNegative}
          />
          <div className={style.indDelay} />
        </div>
        <div className={style.timer}>
          <Countdown time={timer?.running} small negative={isNegative} />
        </div>
        <div className={style.start}>
          <span className={style.tag}>Started at </span>
          <span className={style.time}>{started}</span>
        </div>
        <div className={style.finish}>
          <span className={style.tag}>Finish at </span>
          <span className={style.time}>{finish}</span>
        </div>
        <div className={style.btn}>
          <Button
            {...incrementProps}
            onClick={() => socket.emit('increment-timer', 1)}
          >
            +1
          </Button>
          <Button
            {...incrementProps}
            onClick={() => socket.emit('increment-timer', 5)}
          >
            +5
          </Button>
          <Button
            {...incrementProps}
            onClick={() => socket.emit('increment-timer', -1)}
          >
            -1
          </Button>
          <Button
            {...incrementProps}
            onClick={() => socket.emit('increment-timer', -5)}
          >
            -5
          </Button>
        </div>
      </div>
      <PlaybackButtons
        playback={playback}
        selectedId={selectedId}
        playbackControl={playbackControl}
      />
    </div>
  );
}
