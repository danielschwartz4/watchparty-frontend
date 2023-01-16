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

export interface UserType {
  _id?: string;
  name: string;
  sessionId: string;
}

export interface SessionType {
  _id?: string;
  sessionId: string;
  elapsedTime: number;
  startVideoUrl: string;
  currentVideoUrl: string;
}

// ? 3. Do replay for pause and play only

export interface EventType {
  _id?: string;
  userId: string;
  sessionId: string;
  type: "Pause" | "Play" | "Seek" | "Switch";
  sessionIncrement: number;
  globalTimeStamp?: Date;
  timeStamp?: number;
  seekToTimeStamp?: number;
  pauseTimeElapsed?: number;
  newVideoUrl?: string;
}
