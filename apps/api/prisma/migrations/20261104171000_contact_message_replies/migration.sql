ALTER TABLE "EmailNotification"
ADD COLUMN "replyTo" TEXT;

CREATE TABLE "ContactMessageReply" (
    "id" TEXT NOT NULL,
    "contactMessageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessageReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactMessageReply_contactMessageId_createdAt_idx"
ON "ContactMessageReply"("contactMessageId", "createdAt");

ALTER TABLE "ContactMessageReply"
ADD CONSTRAINT "ContactMessageReply_contactMessageId_fkey"
FOREIGN KEY ("contactMessageId") REFERENCES "ContactMessage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
