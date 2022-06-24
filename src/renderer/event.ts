import EventEmitter from 'eventemitter3';

export const EVENT = {
  TOGGLE_SIDEBAR: 'toggle_sidebar',
};

export const eventBus = new EventEmitter();
