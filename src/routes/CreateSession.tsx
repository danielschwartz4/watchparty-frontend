import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CURRENT_URL } from "../constants";
import { SessionType } from "../types";

interface CreateSessionProps {}

const CreateSession: React.FC<CreateSessionProps> = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  const createSession = async () => {
    setUrl("");
    const sessionId = uuidv4();
    // Add session to database
    const params: SessionType = {
      sessionId: sessionId,
      elapsedTime: 0,
      startVideoUrl: url,
      currentVideoUrl: url,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    };
    await fetch(`${CURRENT_URL}/session/create`, options);

    navigate(
      `/watch/${sessionId}`
      // , { state: { url: url } }
    );
  };

  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
      <TextField
        label="Youtube URL"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        fullWidth
      />
      <Button
        disabled={!url}
        onClick={createSession}
        size="small"
        variant="contained"
      >
        Create a session
      </Button>
    </Box>
  );
};

export default CreateSession;
