-- CreateTable
CREATE TABLE "CareerTree" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rootTitle" TEXT NOT NULL,
    "formInput" TEXT NOT NULL,
    "treeData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerTree_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CareerTree" ADD CONSTRAINT "CareerTree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
