import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export interface ProductSaleRow {
  id: string;
  name: string;
  category: string;
  finalPrice: number;
  createdAt: Date;
}

export async function getAllProductSales(): Promise<ProductSaleRow[]> {
  const rows = await db
    .select({
      id: schema.productSales.id,
      name: schema.products.name,
      category: schema.products.category,
      finalPrice: schema.productSales.total,
      createdAt: schema.productSales.createdAt,
    })
    .from(schema.productSales)
    .innerJoin(schema.products, eq(schema.productSales.productId, schema.products.id))
    .orderBy(desc(schema.productSales.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    finalPrice: Number(row.finalPrice ?? 0),
    createdAt: row.createdAt,
  }));
}
