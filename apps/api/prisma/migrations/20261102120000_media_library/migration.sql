CREATE TYPE "MediaType" AS ENUM ('NEWS', 'PROJECT', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaItem_published_type_createdAt_idx" ON "MediaItem"("published", "type", "createdAt");