import { getMonthlyBudgetReport } from "@/actions/budgets";
import { getCategories } from "@/actions/categories";
import { BudgetsView } from "@/components/budgets/budgets-view";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const [reportResult, catResult] = await Promise.all([
    getMonthlyBudgetReport(currentMonth, currentYear),
    getCategories("EXPENSE"),
  ]);

  const initialReport =
    reportResult.success && reportResult.data
      ? reportResult.data
      : {
          month: currentMonth,
          year: currentYear,
          categories: [],
          alerts: [],
        };

  const categories =
    catResult.success && catResult.data ? (catResult.data as any) : [];

  return (
    <BudgetsView
      initialReport={initialReport}
      categories={categories}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
