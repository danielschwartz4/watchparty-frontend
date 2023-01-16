import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { useParams } from "react-router-dom";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { CURRENT_BROWSER_URL, CURRENT_URL } from "../constants";
import { EventType, SessionType } from "../types";
import { VideoReplayer } from "../components/VideoReplayer";

const ReplaySession: React.FC = () => {
  const { sessionId } = useParams();
  const [url, setUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [session, setSession] = useState<SessionType>();
  const [events, setEvents] = useState<EventType[]>();

  useEffect(() => {
    // Fetch session to get current video
    fetch(`${CURRENT_URL}/session/get/${sessionId}`)
      .then((res) => res.json())
      .then((res: { session: SessionType }) => {
        setUrl(res.session.currentVideoUrl);
        setSession(res.session);
      });

    // !! Need event for when all users leave the session
    // Fetch events
    fetch(`${CURRENT_URL}/event/getSessionEvents/${sessionId}`)
      .then((res) => res.json())
      .then((res: { event: EventType[] }) => {
        setEvents(res.event);
      });
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
          <TextField
            label="Youtube URL"
            variant="outlined"
            value={url}
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
            fullWidth
          />
          <Tooltip
            title={linkCopied ? "Link copied" : "Copy replay link to share"}
          >
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
        </Box>
        {events ? (
          <VideoReplayer
            url={url}
            setUrl={setUrl}
            hideControls
            events={events}
          />
        ) : (
          <Box>This session hasn't started yet!</Box>
        )}
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

export default ReplaySession;
