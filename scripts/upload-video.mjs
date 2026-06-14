import { createClient } from "@supabase/supabase-js";
import { createReadStream, statSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_KEY in env");
  process.exit(1);
}

const BUCKET = "videos";
const FILE_PATH = resolve("video/VID_20260603_010309.mp4");
const STORAGE_PATH = "cine/pelicula.mp4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create bucket if it doesn't exist
const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
  public: true,
  fileSizeLimit: null,
});
if (bucketError && !bucketError.message.includes("already exists")) {
  console.error("Bucket error:", bucketError.message);
  process.exit(1);
}
console.log(`Bucket "${BUCKET}" ready.`);

// Read file
const stats = statSync(FILE_PATH);
const fileSizeMB = (stats.size / 1024 / 1024).toFixed(1);
console.log(`Uploading ${fileSizeMB} MB...`);

const fileBuffer = await new Promise((resolve, reject) => {
  const chunks = [];
  const stream = createReadStream(FILE_PATH);
  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("end", () => resolve(Buffer.concat(chunks)));
  stream.on("error", reject);
});

const { data, error } = await supabase.storage
  .from(BUCKET)
  .upload(STORAGE_PATH, fileBuffer, {
    contentType: "video/mp4",
    upsert: true,
  });

if (error) {
  console.error("Upload error:", error.message);
  process.exit(1);
}

const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(STORAGE_PATH);
console.log("\nDone!");
console.log("Public URL:", urlData.publicUrl);
