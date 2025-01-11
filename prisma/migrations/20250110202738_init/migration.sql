-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "uname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XP" (
    "id" SERIAL NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "XP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" SERIAL NOT NULL,
    "rankName" TEXT NOT NULL,
    "minXp" INTEGER NOT NULL,
    "maxXp" INTEGER NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_uname_key" ON "User"("uname");

-- CreateIndex
CREATE UNIQUE INDEX "XP_userId_key" ON "XP"("userId");

-- AddForeignKey
ALTER TABLE "XP" ADD CONSTRAINT "XP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
