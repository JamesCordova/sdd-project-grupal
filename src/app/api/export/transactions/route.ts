import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateTransactionsCSV, type ExportTransactionRow } from "@/lib/export/csv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({
        where: { email: "demo@finanzas.pe" },
      });
      if (demoUser) {
        userId = demoUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");

    // Construir filtro de consulta
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    if (type && (type === "INCOME" || type === "EXPENSE")) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    const rows: ExportTransactionRow[] = transactions.map((t) => ({
      date: t.date.toISOString().split("T")[0],
      type: t.type,
      categoryName: t.category.name,
      amount: Number(t.amount),
      description: t.description,
    }));

    const csvContent = generateTransactionsCSV(rows);

    const nowStr = new Date().toISOString().split("T")[0];
    const filename = `transacciones_${nowStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error en exportación CSV:", error);
    return NextResponse.json(
      { error: "Error al generar la exportación CSV" },
      { status: 500 }
    );
  }
}
