import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { CURRENT_URL } from "../constants";
import { EventType, MessagePayload, State, UserType } from "../types";
import { sendMessage } from "../utils";

interface VideoPlayerProps {
  ws: WebSocket | null;
  url: string;
  sessionId: string;
  setUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  setNewUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  hideControls?: boolean;
  user: UserType | undefined;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  ws,
  url,
  setUrl,
  setNewUrl,
  hideControls,
  sessionId,
  user,
}) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const player = useRef<ReactPlayer | null>(null);
  const prevPlayerState = useRef<State | null>(null);

  function messageReceipt(data: MessagePayload) {
    console.log("in show message", data.message, data.type);
    switch (data.type) {
      case "seek":
        player.current?.seekTo(parseFloat(data.message));
        break;

      case "pause":
        // !! Don't pause on pause seek to the paused time
        setIsPlaying(data.message === "false");
        break;

      case "url-change":
        if (setUrl && setNewUrl) {
          setUrl(data.message);
          setNewUrl(data.message);
        }
        const params = { currentVideoUrl: data.message };
        const options = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        };
        fetch(`${CURRENT_URL}/session/update/${sessionId}`, options);
        break;
    }
  }

  useEffect(() => {
    if (ws) {
      ws.onmessage = ({ data }) => messageReceipt(JSON.parse(data));
      ws.onopen = () => {
        console.log("Connection opened!");
      };
      ws.onclose = () => {
        console.log("Connection closed!");
      };
    }
  }, [ws]);

  console.log("URL", url);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
  };

  const handlePlay = () => {
    const params: EventType = {
      userId: user?._id as string,
      sessionId: sessionId,
      type: "Play",
      sessionIncrement: 1,
      timeStamp: player.current?.getCurrentTime() as number,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    };
    fetch(`${CURRENT_URL}/event/create`, options);
    sendMessage(ws, "pause", "false");
  };

  const handlePause = () => {
    const params: EventType = {
      userId: user?._id as string,
      sessionId: sessionId,
      type: "Pause",
      sessionIncrement: 1,
      timeStamp: player.current?.getCurrentTime() as number,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    };
    fetch(`${CURRENT_URL}/event/create`, options);
    sendMessage(ws, "pause", "true");
  };

  const handleBuffer = () => {
    console.log("Video buffered");
  };

  const handleProgress = (state: State) => {
    if (prevPlayerState.current) {
      const diff = Math.abs(
        state.playedSeconds - prevPlayerState.current?.playedSeconds
      );
      // !! Find better way to do this
      if (diff > 0.2) {
        const seekToTimeStamp = state.playedSeconds;
        const params: EventType = {
          userId: user?._id as string,
          sessionId: sessionId,
          type: "Seek",
          sessionIncrement: 1,
          timeStamp: player.current?.getCurrentTime() as number,
          seekToTimeStamp: seekToTimeStamp,
        };
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        };
        fetch(`${CURRENT_URL}/event/create`, options);
        sendMessage(ws, "seek", seekToTimeStamp.toString());
      }
    }
    prevPlayerState.current = state;
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
          playing={isPlaying}
          controls={!hideControls}
          progressInterval={100}
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
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setHasJoined(true);
            setIsPlaying(true);
            const currTime = player.current?.getCurrentTime().toString();
            if (currTime) {
              sendMessage(ws, "seek", currTime);
            }
          }}
        >
          Watch Session
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
