import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export interface ProductSaleRow {
  id: string;
  name: string;
  category: string;
  finalPrice: number;
  createdAt: Date;
}

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  createdAt: Date;
}

export async function getProducts(): Promise<ProductRow[]> {
  const rows = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      category: schema.products.category,
      price: schema.products.price,
      createdAt: schema.products.createdAt,
    })
    .from(schema.products)
    .orderBy(asc(schema.products.category), asc(schema.products.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price ?? 0),
    createdAt: row.createdAt,
  }));
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
