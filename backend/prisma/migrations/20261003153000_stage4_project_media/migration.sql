-- Stage 4: richer project metadata and media
ALTER TABLE "Project"
  ADD COLUMN "imageUrl" VARCHAR(500),
  ADD COLUMN "technologies" JSONB,
  ADD COLUMN "githubUrl" VARCHAR(500),
  ADD COLUMN "liveUrl" VARCHAR(500),
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
