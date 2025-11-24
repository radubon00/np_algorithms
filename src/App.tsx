// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import KnapsackPage from "./pages/knapsack";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Knapsack visualizer */}
        <Route path="/knapsack" element={<KnapsackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
