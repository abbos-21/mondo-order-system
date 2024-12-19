/*
  Warnings:

  - A unique constraint covering the columns `[location]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_location_key" ON "Branch"("location");
