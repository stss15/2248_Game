import { Howl } from 'howler';

const sounds = {
  merge: new Howl({ src: ['/sounds/merge.mp3'], volume: 0.7 }),
  pathSelect: new Howl({ src: ['/sounds/select.wav'], volume: 0.3 }),
  powerUpAppear: new Howl({ src: ['/sounds/powerup.wav'], volume: 0.6 }),
  bomb: new Howl({ src: ['/sounds/bomb.mp3'], volume: 1.0 }),
  gameOver: new Howl({ src: ['/sounds/gameover.wav'], volume: 0.8 }),
};

export enum SoundType {
  MERGE,
  PATH_SELECT,
  POWERUP_APPEAR,
  BOMB,
  GAME_OVER,
}

export const playSound = (type: SoundType) => {
  switch (type) {
    case SoundType.MERGE:
      sounds.merge.play();
      break;
    case SoundType.PATH_SELECT:
      if (!sounds.pathSelect.playing()) {
        sounds.pathSelect.play();
      }
      break;
    case SoundType.POWERUP_APPEAR:
      sounds.powerUpAppear.play();
      break;
    case SoundType.BOMB:
      sounds.bomb.play();
      break;
    case SoundType.GAME_OVER:
      sounds.gameOver.play();
      break;
  }
};
