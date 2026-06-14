import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { RecipeListPage } from './pages/RecipeListPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { MatcherPage } from './pages/MatcherPage';
import { CommonIngredientsPage } from './pages/CommonIngredientsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<RecipeListPage />} />
        <Route path="recipe/:id" element={<RecipeDetailPage />} />
        <Route path="matcher" element={<MatcherPage />} />
        <Route path="common" element={<CommonIngredientsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
