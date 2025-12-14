import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./app/Layouts/Home/Home";
import HomeLive from "./app/Layouts/HomeLive/HomeLive";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" exact element={<Home />} />
      <Route path="/live" element={<HomeLive />} />
    </Routes>
  );
}

export default App;
