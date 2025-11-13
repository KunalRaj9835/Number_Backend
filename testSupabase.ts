import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ffifonhbzyyjbmaqpyqt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaWZvbmhienl5amJtYXFweXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwMzg1OCwiZXhwIjoyMDc0Mzc5ODU4fQ.2-U-Ta9F091JBqTUs2PMRXn5rJbO8s2ZUici5cbX8Q8"
);

(async () => {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
})();
