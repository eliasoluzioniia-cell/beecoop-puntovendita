/**
 * ==============================================================================
 * BEE COOP Impresa Sociale - Webhook Bridge per Next.js App Router (Vercel)
 * Deployment: beecoop-puntovendita.vercel.app
 * ==============================================================================
 * Intercetta gli eventi checkout.session.completed di Stripe, valida la firma
 * crittografica dell'evento e inoltra il task anonimizzato a Paperclip Hub.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
const paperclipApiUrl = process.env.PAPERCLIP_API_URL || "http://localhost:3000/api/tasks"
const paperclipApiToken = process.env.PAPERCLIP_API_TOKEN || ""

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any,
})

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Firma webhook o configurazione segreta mancante." },
        { status: 400 }
      )
    }

    // 1. Verifica dell'autenticità crittografica dell'evento Stripe
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error("[Stripe Webhook Error]:", err.message)
      return NextResponse.json(
        { error: `Verifica firma fallita: ${err.message}` },
        { status: 400 }
      )
    }

    // 2. Intercettazione dell'ordine confermato
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Estrazione metadati e dettagli di consegna
      const customerEmail = session.customer_details?.email || ""
      const customerName = session.customer_details?.name || "Cliente Sostenitore"
      const shippingAddress = session.shipping_details?.address || session.customer_details?.address

      // Preparazione payload per Paperclip Hub (il Privacy Officer locale tokenizzerà i PII in CLI_ID_xxx)
      const paperclipPayload = {
        action: "PROCESS_CONFIRMED_ORDER",
        source: "stripe_webhook_vercel",
        stripe_event_id: event.id,
        checkout_session_id: session.id,
        amount_total_eur: (session.amount_total || 0) / 100,
        currency: session.currency || "eur",
        raw_customer: {
          name: customerName,
          email: customerEmail,
          delivery_address: {
            street: shippingAddress?.line1 || "",
            city: shippingAddress?.city || "Enna",
            zip: shippingAddress?.postal_code || "94100",
            country: shippingAddress?.country || "IT",
          },
        },
        metadata: session.metadata || {},
        timestamp: new Date().toISOString(),
      }

      // 3. Inoltro protetto via HTTP a Paperclip Hub
      const paperclipResponse = await fetch(paperclipApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${paperclipApiToken}`,
          "X-BEECOOP-Source": "NextJS-Landing-Vercel",
        },
        body: JSON.stringify(paperclipPayload),
      })

      if (!paperclipResponse.ok) {
        const errorText = await paperclipResponse.text()
        console.error("[Paperclip Forward Error]:", paperclipResponse.status, errorText)
        return NextResponse.json(
          {
            received: true,
            warning: "Ordine ricevuto ma inoltro a Paperclip Hub non riuscito.",
            paperclip_status: paperclipResponse.status,
          },
          { status: 502 }
        )
      }

      const paperclipResult = await paperclipResponse.json()
      console.log("[Paperclip Hub Inoltro Riuscito]:", paperclipResult)

      return NextResponse.json({
        received: true,
        status: "FORWARDED_TO_PAPERCLIP",
        event_id: event.id,
      })
    }

    return NextResponse.json({ received: true, ignored_type: event.type })
  } catch (globalError: any) {
    console.error("[Order Bridge Fatal Error]:", globalError)
    return NextResponse.json(
      { error: "Errore interno durante il processamento dell'ordine." },
      { status: 500 }
    )
  }
}
