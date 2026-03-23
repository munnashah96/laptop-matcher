-- CreateTable
CREATE TABLE "laptops" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "processor" TEXT NOT NULL,
    "ram_gb" INTEGER NOT NULL,
    "storage_gb" INTEGER NOT NULL,
    "storage_type" TEXT NOT NULL,
    "graphics" TEXT NOT NULL,
    "price_usd" INTEGER NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "screen_inches" DOUBLE PRECISION NOT NULL,
    "affiliate_link" TEXT,

    CONSTRAINT "laptops_pkey" PRIMARY KEY ("id")
);
