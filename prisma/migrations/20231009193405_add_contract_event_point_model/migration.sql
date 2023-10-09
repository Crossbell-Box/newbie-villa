-- CreateTable
CREATE TABLE "ContractEventPoint" (
    "name" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,

    CONSTRAINT "ContractEventPoint_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractEventPoint_name_key" ON "ContractEventPoint"("name");
