CREATE TABLE "code_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"repo" text NOT NULL,
	"commit_sha" text NOT NULL,
	"file_path" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
