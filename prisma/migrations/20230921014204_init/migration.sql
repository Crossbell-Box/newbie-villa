-- CreateTable
CREATE TABLE "email_user" (
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "character_withdrawn_at" TIMESTAMP(3),
    "character_withdrawn_to" TEXT,
    "csb" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "email_user_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_user_email_key" ON "email_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_user_characterId_key" ON "email_user"("characterId");

-- CreateIndex
CREATE INDEX "email_user_characterId_idx" ON "email_user"("characterId");

-- CreateIndex
CREATE INDEX "email_user_character_withdrawn_at_idx" ON "email_user"("character_withdrawn_at");

-- CreateIndex
CREATE INDEX "email_user_character_withdrawn_to_idx" ON "email_user"("character_withdrawn_to");

-- CreateIndex
CREATE INDEX "email_user_created_at_idx" ON "email_user"("created_at" DESC);

-- CreateIndex
CREATE INDEX "email_user_updated_at_idx" ON "email_user"("updated_at" DESC);

-- CreateIndex
CREATE INDEX "email_user_deleted_at_idx" ON "email_user"("deleted_at" DESC);
