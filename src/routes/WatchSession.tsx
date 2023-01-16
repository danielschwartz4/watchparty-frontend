import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { sendMessage } from "../utils";
import { CURRENT_BROWSER_URL, CURRENT_URL } from "../constants";
import { EventType, SessionType, UserType } from "../types";

interface WatchSessionProps {}

const WatchSession: React.FC<WatchSessionProps> = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [user, setUser] = useState<UserType>();

  useEffect(() => {
    // Create user
    const params: UserType = {
      name: "none",
      sessionId: sessionId as string,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    };
    fetch(`${CURRENT_URL}/user/create`, options)
      .then((res) => res.json())
      .then((res: { user: UserType }) => {
        setUser(res.user);
      });

    // Fetch session to get current video
    fetch(`${CURRENT_URL}/session/get/${sessionId}`)
      .then((res) => res.json())
      .then((res: { session: SessionType }) => {
        console.log("RES", res);
        console.log("res.session.currentVideoUrl", res.session.currentVideoUrl);
        setUrl(res.session.currentVideoUrl);
        setNewUrl(res.session.currentVideoUrl);
      });
    const newWs = new WebSocket(`ws://localhost:8080/watch/${sessionId}`);
    setWs(newWs);
    // if session ID doesn't exist, you'll probably want to redirect back to the home / create session page
  }, [sessionId]);

  if (!!url && sessionId) {
    return (
      <>
        <Box
          width="100%"
          maxWidth={1000}
          display="flex"
          gap={1}
          marginTop={1}
          alignItems="center"
        >
          <Box display={"flex"}>
            <Box width={"500px"}>
              <TextField
                label="Youtube URL"
                variant="outlined"
                value={newUrl}
                fullWidth
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </Box>
            <Button
              onClick={() => {
                if (newUrl) {
                  setUrl(newUrl);
                  const eventParams: EventType = {
                    userId: user?._id as string,
                    sessionId: sessionId,
                    type: "Switch",
                    sessionIncrement: 1,
                    newVideoUrl: newUrl,
                  };
                  const eventOptions = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(eventParams),
                  };
                  fetch(`${CURRENT_URL}/event/create`, eventOptions);
                  sendMessage(ws, "url-change", newUrl);
                }
              }}
            >
              Change Video
            </Button>
          </Box>
          <Tooltip title={linkCopied ? "Link copied" : "Copy link to share"}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              disabled={linkCopied}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <LinkIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Replay this watch party">
            <Button
              onClick={() => {
                window.open(`/replay/${sessionId}`, "_blank");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <VideoLibraryIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Create new watch party">
            <Button
              onClick={() => {
                navigate("/create");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <AddCircleOutlineIcon />
            </Button>
          </Tooltip>
        </Box>
        <VideoPlayer
          ws={ws}
          url={url}
          setUrl={setUrl}
          setNewUrl={setNewUrl}
          sessionId={sessionId}
          user={user}
        />
      </>
    );
  }

  return (
    <Box>
      Not a valid session. Create one{" "}
      <a href={`${CURRENT_BROWSER_URL}/create`}>here</a>!
    </Box>
  );
};

export default WatchSession;
