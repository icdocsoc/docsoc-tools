-- CreateTable
CREATE TABLE "CommitteeMember" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shortcode" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "phone" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_cid_key" ON "CommitteeMember"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_shortcode_key" ON "CommitteeMember"("shortcode");
