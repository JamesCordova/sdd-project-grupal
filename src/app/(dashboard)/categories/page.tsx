import { getCategories } from "@/actions/categories";
import { CategoriesView } from "@/components/categories/categories-view";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const result = await getCategories();
  const categories = result.success && result.data ? (result.data as any) : [];

  return <CategoriesView categories={categories} />;
}
