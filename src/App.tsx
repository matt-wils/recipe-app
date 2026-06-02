import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RecipeListPage } from './pages/RecipeListPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { MatcherPage } from './pages/MatcherPage';
import { CommonIngredientsPage } from './pages/CommonIngredientsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<RecipeListPage />} />
        <Route path="recipe/new" element={<RecipeFormPage />} />
        <Route path="recipe/:id" element={<RecipeDetailPage />} />
        <Route path="recipe/:id/edit" element={<RecipeFormPage />} />
        <Route path="matcher" element={<MatcherPage />} />
        <Route path="common" element={<CommonIngredientsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
