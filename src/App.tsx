import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { RecipeListPage } from './pages/RecipeListPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { MatcherPage } from './pages/MatcherPage';
import { CommonIngredientsPage } from './pages/CommonIngredientsPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { PlatePage } from './pages/PlatePage';
import { IngredientDetailPage } from './pages/IngredientDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<RecipeListPage />} />
        <Route path="recipe/:id" element={<RecipeDetailPage />} />
        <Route path="matcher" element={<MatcherPage />} />
        <Route path="common" element={<CommonIngredientsPage />} />
        <Route path="shopping-list" element={<ShoppingListPage />} />
        <Route path="plate" element={<PlatePage />} />
        <Route path="ingredient/:id" element={<IngredientDetailPage />} />
      </Route>
    </Routes>
  );
}
