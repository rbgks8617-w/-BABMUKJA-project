ALTER TABLE "reviews" ADD COLUMN "author_user_id" TEXT;
ALTER TABLE "review_comments" ADD COLUMN "author_user_id" TEXT;
ALTER TABLE "meal_mate_rooms" ADD COLUMN "creator_user_id" TEXT;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_user_id_fkey"
  FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meal_mate_rooms" ADD CONSTRAINT "meal_mate_rooms_creator_user_id_fkey"
  FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_author_user_id_fkey"
  FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "review_comments_review_id_author_user_id_idx" ON "review_comments"("review_id", "author_user_id");
