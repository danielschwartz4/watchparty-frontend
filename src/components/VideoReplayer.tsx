import { Box, Button } from "@mui/material";

import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { EventType } from "../types";

interface VideoReplayerProps {
  url: string;
  hideControls: boolean;
  events: EventType[];
}

export const VideoReplayer: React.FC<VideoReplayerProps> = ({
  url,
  hideControls,
  events,
}) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [eventStack, setEventStack] = useState<EventType[]>();
  const player = useRef<ReactPlayer>(null);

  console.log("EVENTS", events);

  useEffect(() => {
    setEventStack(events);
  }, [events]);

  useEffect(() => {
    const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

    async function execute() {
      if (hasJoined && eventStack) {
        while (eventStack) {
          const currEvent = eventStack.shift();
          const nextEvent = eventStack[0];
          if (currEvent && currEvent.type === "Play") {
            setIsPlaying(true);
          } else if (currEvent && currEvent.type === "Pause") {
            setIsPlaying(false);
          }
          if (currEvent?.globalTimeStamp && nextEvent.globalTimeStamp) {
            const timeElapsed =
              new Date(nextEvent.globalTimeStamp).valueOf() -
              new Date(currEvent.globalTimeStamp).valueOf();
            await timer(timeElapsed);
            console.log("currEvent", currEvent);
            console.log("TIME ELAPSED", timeElapsed);
          }
        }
      }
    }
    execute();
  }, [hasJoined]);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
  };

  const handlePlay = () => {
    console.log(
      "User played video at time: ",
      player.current?.getCurrentTime()
    );
  };

  const handlePause = () => {
    console.log(
      "User paused video at time: ",
      player.current?.getCurrentTime()
    );
  };

  const handleBuffer = () => {
    console.log("Video buffered");
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    console.log("Video progress: ", state);
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="100%"
        display={hasJoined ? "flex" : "none"}
        flexDirection="column"
      >
        <ReactPlayer
          ref={player}
          url={url}
          // playing={hasJoined}
          playing={isPlaying}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />
      </Box>
      {!hasJoined && isReady && (
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setIsPlaying(true);
            setHasJoined(true);
          }}
        >
          Watch Session
        </Button>
      )}
    </Box>
  );
};
