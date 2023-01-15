import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { MessagePayload, State } from "../types";
import { sendMessage } from "../utils";

interface VideoPlayerProps {
  ws: WebSocket | null;
  url: string;
  setUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  newUrl?: string | null;
  setNewUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  hideControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  ws,
  url,
  setUrl,
  newUrl,
  setNewUrl,
  hideControls,
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
        setIsPlaying(data.message === "false");
        break;

      case "url-change":
        console.log("new url", data.message);
        if (setUrl && newUrl && setNewUrl) {
          setUrl(data.message);
          setNewUrl(data.message);
        }
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

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
  };

  const handleSeek = (seconds: number) => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?

    console.log(
      "This never prints because seek decetion doesn't work: ",
      seconds
    );
  };

  const handlePlay = () => {
    sendMessage(ws, "pause", "false");
  };

  const handlePause = () => {
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
        console.log("HERE");
        sendMessage(ws, "seek", state.playedSeconds.toString());
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
          onSeek={handleSeek}
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
