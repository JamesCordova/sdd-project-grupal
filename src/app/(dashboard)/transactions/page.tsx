import { getTransactions } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { TransactionsView } from "@/components/transactions/transactions-view";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [transResult, catResult] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const initialData =
    transResult.success && transResult.data
      ? (transResult.data as any)
      : {
          items: [],
          total: 0,
          summary: { totalIncome: 0, totalExpense: 0, netBalance: 0 },
        };

  const categories =
    catResult.success && catResult.data ? (catResult.data as any) : [];

  return <TransactionsView initialData={initialData} categories={categories} />;
}
