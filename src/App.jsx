import React from "react";
import { Routes, Route } from "react-router-dom"
import Home from "./app/Layouts/Home/Home";
import "./App.css";

function App() {
  return (
      <Routes>
          <Route path="/" exact element={<Home/>} />
      </Routes>
  );
}

export default App;
