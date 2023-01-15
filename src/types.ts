export type State = {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
};

export type MessagePayload = {
  message: string;
  type: string;
};
