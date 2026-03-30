import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 🔐 Leer API KEY desde Secrets
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // 🔹 1. GUARDAR CONTACTO EN BREVO
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true
      })
    });

    // 🔹 2. ENVIAR CORREO DE BIENVENIDA
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: "Guijarro & Guijarro Asesores Tributarios",
          email: "guijarroyguijarrotk@gmail.com" // ⚠️ Debe estar verificado en Brevo
        },
        to: [{ email: email }],
        subject: "¡Bienvenido a GYG ASESORES!",
        htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
          
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                
                <table width="500" style="background:#ffffff; border-radius:10px; overflow:hidden;">
                  
                  <!-- HEADER -->
                  <tr style="background:#0e3d92;">
                    <td align="center" style="padding:20px;">
                      <img src="logo.png" width="150">
                    </td>
                  </tr>

                  <!-- CONTENIDO -->
                  <tr>
                    <td style="padding:30px; text-align:center;">
                      
                      <h1 style="color:#0e3d92;">¡Felicidades!</h1>
                      
                      <p style="font-size:16px; color:#333;">
                        Te has registrado exitosamente en
                      </p>

                      <p style="font-weight:bold; color:#0e3d92;">
                        Guijarro & Guijarro Asesores Tributarios S.A.
                      </p>

                      <p style="color:#555;">
                        Ahora puedes acceder a nuestros servicios y recibir asesoría especializada.
                      </p>

                      <a href="#" style="
                        display:inline-block;
                        margin-top:20px;
                        padding:12px 25px;
                        background:#f8b700;
                        color:#000;
                        text-decoration:none;
                        border-radius:5px;
                        font-weight:bold;
                      ">
                        Ir al sitio web
                      </a>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f8b700; text-align:center; padding:15px; font-size:12px;">
                      © 2025 Guijarro & Guijarro Asesores Tributarios
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
        `
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
