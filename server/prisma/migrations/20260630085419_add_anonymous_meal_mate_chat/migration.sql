-- AlterTable
ALTER TABLE "meal_mate_rooms" ADD COLUMN     "creator_key" TEXT;

-- AlterTable
ALTER TABLE "review_comments" ADD COLUMN     "anonymous_number" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "participant_key" TEXT NOT NULL DEFAULT 'legacy-viewer';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "author_key" TEXT;

-- CreateTable
CREATE TABLE "meal_mate_members" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "participant_key" TEXT NOT NULL,
    "anonymous_number" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_mate_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_mate_messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "participant_key" TEXT NOT NULL,
    "anonymous_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_mate_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_mate_members_participant_key_idx" ON "meal_mate_members"("participant_key");

-- CreateIndex
CREATE UNIQUE INDEX "meal_mate_members_room_id_participant_key_key" ON "meal_mate_members"("room_id", "participant_key");

-- CreateIndex
CREATE INDEX "meal_mate_messages_room_id_created_at_idx" ON "meal_mate_messages"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "review_comments_review_id_participant_key_idx" ON "review_comments"("review_id", "participant_key");

-- AddForeignKey
ALTER TABLE "meal_mate_members" ADD CONSTRAINT "meal_mate_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meal_mate_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_mate_messages" ADD CONSTRAINT "meal_mate_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meal_mate_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
