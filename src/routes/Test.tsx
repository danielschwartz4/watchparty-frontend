import { Box, Button, Input, Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface TestProps {}

const Test: React.FC<TestProps> = ({}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [textValue, setTextValue] = useState<string>("");

  function showMessage(message: string) {
    console.log("in show message", messages);
    if (messages) {
      setMessages([...messages, message]);
    } else {
      setMessages([message]);
    }
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    console.log("hello");
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      showMessage("No WebSocket connection :(");
      return;
    }
    if (textValue) {
      ws.send(textValue);
      showMessage(textValue);
    }
    setTextValue("");
  }

  useEffect(() => {
    console.log("in effect");
    const newWs = new WebSocket("ws://localhost:8080");
    setWs(newWs);
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onmessage = ({ data }) => showMessage(data);
      ws.onopen = () => {
        console.log("Connection opened!");
      };
      ws.onclose = () => {
        console.log("Connection closed!");
      };
    }
  }, [ws, messages]);

  return (
    <Box>
      <Stack>
        {messages?.map((m, i) => {
          return <Box key={i}>{m}</Box>;
        })}
      </Stack>
      <Box display={"flex"}>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="message"
            value={textValue}
            onChange={(e) => {
              setTextValue(e.target.value);
            }}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Box>
    </Box>
  );
};

export default Test;
