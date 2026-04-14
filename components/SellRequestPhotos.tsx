"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  filePaths: string[];
};

export default function SellRequestPhotos({ filePaths }: Props) {
  const supabase = createClient();
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadUrls() {
      if (!filePaths.length) {
        setUrls([]);
        return;
      }

      const nextUrls: string[] = [];

      for (const filePath of filePaths) {
        const { data, error } = await supabase.storage
          .from("sell-request-photos")
          .createSignedUrl(filePath, 3600);

        if (!error && data?.signedUrl) {
          nextUrls.push(data.signedUrl);
        }
      }

      if (!cancelled) {
        setUrls(nextUrls);
      }
    }

    loadUrls();

    return () => {
      cancelled = true;
    };
  }, [filePaths, supabase]);

  if (!urls.length) return null;

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2">Photos</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src={url}
              alt={`Request photo ${index + 1}`}
              className="w-full h-28 object-cover rounded-lg border border-gray-200"
            />
          </a>
        ))}
      </div>
    </div>
  );
}