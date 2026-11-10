
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import HomePage from "./pages/HomePage/HomePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
