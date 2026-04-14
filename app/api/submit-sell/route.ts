import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

function getSellEmailTo() {
  const email = process.env.SELL_EMAIL_TO;
  if (!email) {
    throw new Error("Missing SELL_EMAIL_TO");
  }
  return email;
}

function formatUploadError(uploadError: any, photo: File, filePath: string) {
  return [
    "Could not upload request photos.",
    `Message: ${uploadError?.message || "Unknown upload error"}`,
    `Name: ${uploadError?.name || "Unknown"}`,
    `Status: ${uploadError?.statusCode || uploadError?.status || "Unknown"}`,
    `Bucket: sell-request-photos`,
    `Path: ${filePath}`,
    `File: ${photo.name}`,
    `Type: ${photo.type || "application/octet-stream"}`,
    `Size: ${photo.size} bytes`,
  ].join(" | ");
}

export async function POST(req: NextRequest) {
  let requestId: string | null = null;
  let uploadedPaths: string[] = [];

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    const sellEmailTo = getSellEmailTo();

    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const weightRaw = String(formData.get("weight") || "").trim();
    const karatRaw = String(formData.get("karat") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const estimateRaw = String(formData.get("estimate") || "0").trim();
    const pricePerGramRaw = String(formData.get("pricePerGram") || "0").trim();
    const tierLabel = String(formData.get("tierLabel") || "").trim();
    const unknownWeight = String(formData.get("unknownWeight") || "false") === "true";
    const unknownKarat = String(formData.get("unknownKarat") || "false") === "true";

    const company = String(formData.get("company") || "").trim();
    if (company) {
      return NextResponse.json({ success: true });
    }

    const photos = formData.getAll("photos").filter(Boolean) as File[];

    if (!name) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    if (!contact) {
      return NextResponse.json({ error: "Phone or email is required." }, { status: 400 });
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: "At least one photo is required." }, { status: 400 });
    }

    const weight = unknownWeight || !weightRaw ? null : Number(weightRaw);
    const karat = unknownKarat || !karatRaw ? null : Number(karatRaw);
    const estimate = Number(estimateRaw) || 0;
    const pricePerGram = Number(pricePerGramRaw) || 0;

    const { data: insertedRequest, error: insertError } = await supabaseAdmin
      .from("sell_requests")
      .insert({
        name,
        contact,
        weight,
        karat,
        unknown_weight: unknownWeight,
        unknown_karat: unknownKarat,
        notes: notes || null,
        estimate,
        price_per_gram: pricePerGram,
        tier_label: tierLabel || null,
        status: "new",
        source: "website",
      })
      .select("id")
      .single();

    if (insertError || !insertedRequest) {
      return NextResponse.json(
        {
          error: [
            "Could not save request.",
            `Message: ${insertError?.message || "Unknown insert error"}`,
            `Code: ${insertError?.code || "Unknown"}`,
            `Details: ${insertError?.details || "None"}`,
            `Hint: ${insertError?.hint || "None"}`,
          ].join(" | "),
        },
        { status: 500 }
      );
    }

    requestId = insertedRequest.id;

    for (const photo of photos) {
      const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${crypto.randomUUID()}.${extension}`;
      const filePath = `sell-requests/${requestId}/${filename}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("sell-request-photos")
        .upload(filePath, photo, {
          contentType: photo.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        if (uploadedPaths.length > 0) {
          await supabaseAdmin.storage
            .from("sell-request-photos")
            .remove(uploadedPaths);
        }

        if (requestId) {
          await supabaseAdmin
            .from("sell_request_photos")
            .delete()
            .eq("sell_request_id", requestId);

          await supabaseAdmin
            .from("sell_requests")
            .delete()
            .eq("id", requestId);
        }

        return NextResponse.json(
          { error: formatUploadError(uploadError, photo, filePath) },
          { status: 500 }
        );
      }

      uploadedPaths.push(filePath);

      const { error: photoRowError } = await supabaseAdmin
        .from("sell_request_photos")
        .insert({
          sell_request_id: requestId,
          file_path: filePath,
        });

      if (photoRowError) {
        if (uploadedPaths.length > 0) {
          await supabaseAdmin.storage
            .from("sell-request-photos")
            .remove(uploadedPaths);
        }

        if (requestId) {
          await supabaseAdmin
            .from("sell_requests")
            .delete()
            .eq("id", requestId);
        }

        return NextResponse.json(
          {
            error: [
              "Could not save request photo references.",
              `Message: ${photoRowError?.message || "Unknown photo row error"}`,
              `Code: ${photoRowError?.code || "Unknown"}`,
              `Details: ${photoRowError?.details || "None"}`,
              `Hint: ${photoRowError?.hint || "None"}`,
              `Path: ${filePath}`,
            ].join(" | "),
          },
          { status: 500 }
        );
      }
    }

    const attachments = await Promise.all(
      photos.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Goldzone <hello@goldzone758.com>",
      to: [sellEmailTo],
      replyTo: "goldzone1758@gmail.com",
      subject: "New Gold Evaluation Request",
      text: `
New Gold Evaluation Request

Request ID: ${requestId}
Name: ${name}
Contact: ${contact}

Weight: ${unknownWeight ? "Unknown" : weightRaw || "Unknown"}
Karat: ${unknownKarat ? "Unknown" : karatRaw || "Unknown"}

Estimated Value: ${estimate ? `${estimate.toFixed(2)} XCD` : "To be evaluated"}
Price Per Gram: ${pricePerGram ? `${pricePerGram.toFixed(2)} XCD` : "N/A"}
Tier Label: ${tierLabel || "N/A"}

Notes:
${notes || "None"}
      `,
      attachments,
    });

    if (resendError) {
      if (uploadedPaths.length > 0) {
        await supabaseAdmin.storage
          .from("sell-request-photos")
          .remove(uploadedPaths);
      }

      if (requestId) {
        await supabaseAdmin
          .from("sell_request_photos")
          .delete()
          .eq("sell_request_id", requestId);

        await supabaseAdmin
          .from("sell_requests")
          .delete()
          .eq("id", requestId);
      }

      return NextResponse.json(
        {
          error: `Could not send notification email. | Message: ${
            resendError.message || "Unknown Resend error"
          }`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      emailId: resendData?.id ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Submission failed",
      },
      { status: 500 }
    );
  }
}