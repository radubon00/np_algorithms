// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import KnapsackPage from "./pages/knapsack";
import SubsetPage from "./pages/subset";
import TSPPage from "./pages/tsp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Knapsack visualizer */}
        <Route path="/knapsack" element={<KnapsackPage />} />
        {/* Subset visualizer */}
        <Route path="/subset-sum" element={<SubsetPage/>} />
        {/* TSP visualizer */}
        <Route path="/tsp" element={<TSPPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
