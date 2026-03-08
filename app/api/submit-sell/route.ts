import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {

  try {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const weight = formData.get("weight") as string;
    const karat = formData.get("karat") as string;
    const notes = formData.get("notes") as string;
    const estimate = formData.get("estimate") as string;

    /* ==============================
       HONEYPOT BOT CHECK
    ============================== */

    const company = formData.get("company");

    if (company) {

      console.log("🚫 BOT BLOCKED (honeypot triggered)");

      return NextResponse.json({ success: true });

    }

    const photos = formData.getAll("photos") as File[];

    /* ==============================
       TERMINAL DEBUGGING
    ============================== */

    console.log("----- NEW SELL SUBMISSION -----");
    console.log("Name:", name);
    console.log("Contact:", contact);
    console.log("Weight:", weight);
    console.log("Karat:", karat);
    console.log("Estimate:", estimate);
    console.log("Notes:", notes);
    console.log("Photos uploaded:", photos.length);
    console.log("--------------------------------");

    /* ==============================
       Convert photos to attachments
    ============================== */

    const attachments = await Promise.all(
      photos.map(async (file) => {

        const buffer = Buffer.from(await file.arrayBuffer());

        return {
          filename: file.name,
          content: buffer,
        };

      })
    );

    /* ==============================
       SEND EMAIL
    ============================== */

    await resend.emails.send({

      from: "Goldzone <onboarding@resend.dev>",

      to: process.env.SELL_EMAIL_TO!,

      subject: "New Gold Evaluation Request",

      text: `
New Gold Evaluation Request

Name: ${name}
Contact: ${contact}

Weight: ${weight || "Unknown"}
Karat: ${karat || "Unknown"}

Estimated Value: ${estimate || "To be evaluated"}

Notes:
${notes || "None"}
      `,

      attachments

    });

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error("SELL SUBMISSION ERROR:", error);

    return NextResponse.json(
      { error: "Submission failed" },
      { status: 500 }
    );

  }

}