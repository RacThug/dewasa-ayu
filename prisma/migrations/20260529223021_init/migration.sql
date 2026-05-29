-- CreateEnum
CREATE TYPE "DewasaRuleType" AS ENUM ('ayu', 'ala');

-- CreateTable
CREATE TABLE "ceremony_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ceremony_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dewasa_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DewasaRuleType" NOT NULL,
    "condition" JSONB NOT NULL,
    "description" TEXT,
    "severity" INTEGER NOT NULL DEFAULT 0,
    "applicable_ceremonies" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dewasa_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sasih_corrections" (
    "id" TEXT NOT NULL,
    "tahun_saka" INTEGER NOT NULL,
    "sasih_index" INTEGER NOT NULL,
    "tilem_date" DATE,
    "purnama_date" DATE,
    "is_nampih" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sasih_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'id',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_dates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ceremony_type_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "rate_limit" INTEGER NOT NULL DEFAULT 60,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ceremony_types_slug_key" ON "ceremony_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sasih_corrections_tahun_saka_sasih_index_key" ON "sasih_corrections"("tahun_saka", "sasih_index");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "saved_dates_user_id_idx" ON "saved_dates"("user_id");

-- CreateIndex
CREATE INDEX "saved_dates_ceremony_type_id_idx" ON "saved_dates"("ceremony_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- AddForeignKey
ALTER TABLE "saved_dates" ADD CONSTRAINT "saved_dates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_dates" ADD CONSTRAINT "saved_dates_ceremony_type_id_fkey" FOREIGN KEY ("ceremony_type_id") REFERENCES "ceremony_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
