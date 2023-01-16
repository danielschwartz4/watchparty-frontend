import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import CreateSession from "./routes/CreateSession";
import ReplaySession from "./routes/ReplaySession";
import Test from "./routes/Test";
import WatchSession from "./routes/WatchSession";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  // const [url, setUrl] = useState("");
  // console.log("APP url", url);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
      >
        <Routes>
          <Route path="/" element={<CreateSession />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/test" element={<Test />} />
          <Route path="/watch/:sessionId" element={<WatchSession />} />
          <Route path="/replay/:sessionId" element={<ReplaySession />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;
