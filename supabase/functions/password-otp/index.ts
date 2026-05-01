// Edge function: password-otp
// POST { action: "send", email } -> envoie un code 6 chiffres par email (via Resend si configuré, sinon log)
// POST { action: "verify", email, code, newPassword } -> vérifie + met à jour le mot de passe via service role
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY"); // optionnel

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

// Stockage en mémoire (process). Suffisant pour MVP démo.
const codes = new Map<string, { code: string; expires: number; userId: string }>();

const sendEmail = async (to: string, code: string) => {
  if (!RESEND_KEY) {
    console.log(`[password-otp] Code pour ${to}: ${code}`);
    return { mocked: true };
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "LokalPay Congo <onboarding@resend.dev>",
      to: [to],
      subject: "Code de réinitialisation LokalPay",
      html: `<div style="font-family:Arial;padding:24px;background:#f7f5ef;color:#222">
        <h2 style="color:#228B5A">LokalPay Congo</h2>
        <p>Voici votre code de réinitialisation de mot de passe :</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#228B5A">${code}</p>
        <p style="color:#666;font-size:13px">Ce code expire dans 10 minutes.</p>
      </div>`,
    }),
  });
  return await r.json();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return Response.json({ error: "Email requis" }, { status: 400, headers: corsHeaders });

      // Trouver le user
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const u = list?.users?.find((x: any) => (x.email || "").toLowerCase() === email);
      if (!u) {
        // Réponse identique pour ne pas leaker
        return Response.json({ ok: true }, { headers: corsHeaders });
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      codes.set(email, { code, expires: Date.now() + 10 * 60 * 1000, userId: u.id });
      await sendEmail(email, code);
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    if (action === "verify") {
      const email = String(body.email || "").trim().toLowerCase();
      const code = String(body.code || "").trim();
      const newPassword = String(body.newPassword || "");
      if (!email || !code || newPassword.length < 6) {
        return Response.json({ error: "Champs invalides" }, { status: 400, headers: corsHeaders });
      }
      const entry = codes.get(email);
      if (!entry || entry.expires < Date.now() || entry.code !== code) {
        return Response.json({ error: "Code invalide ou expiré" }, { status: 400, headers: corsHeaders });
      }
      const { error } = await admin.auth.admin.updateUserById(entry.userId, { password: newPassword });
      if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      codes.delete(email);
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return Response.json({ error: "Action inconnue" }, { status: 400, headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
  }
});
