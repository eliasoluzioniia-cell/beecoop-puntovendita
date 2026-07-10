import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, address, notes, items, total } = body

    if (!name || !email || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Dati dell'ordine incompleti o non validi." },
        { status: 400 }
      )
    }

    const notionToken = process.env.NOTION_TOKEN
    const databaseId = process.env.NOTION_ORDERS_DATABASE_ID

    if (!notionToken || !databaseId) {
      console.error("Configurazione Notion mancante in .env.local")
      return NextResponse.json(
        { error: "Configurazione del server incompleta." },
        { status: 500 }
      )
    }

    const notion = new Client({ auth: notionToken })

    // Genera un riassunto testuale dettagliato dei prodotti
    const prodottiDettaglio = items
      .map((item: any) => `${item.quantity}x ${item.title} (un. €${item.price.toFixed(2)})`)
      .join("\n")

    const now = new Date()
    const isoDateString = now.toISOString()

    // Crea la riga dell'ordine nel database Notion
    const response = await notion.pages.create({
      parent: {
        type: "data_source_id",
        data_source_id: databaseId,
      },
      properties: {
        Ordine: {
          title: [
            {
              text: {
                content: `Ordine di ${name}`,
              },
            },
          ],
        },
        Cliente: {
          rich_text: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Email: {
          email: email,
        },
        Telefono: {
          phone_number: phone,
        },
        Indirizzo: {
          rich_text: [
            {
              text: {
                content: address || "",
              },
            },
          ],
        },
        Note: {
          rich_text: [
            {
              text: {
                content: notes || "",
              },
            },
          ],
        },
        Stato: {
          status: {
            name: "Nuovo",
          },
        },
        Totale: {
          number: parseFloat(total) || 0,
        },
        Prodotti_Dettaglio: {
          rich_text: [
            {
              text: {
                content: prodottiDettaglio,
              },
            },
          ],
        },
        Data: {
          date: {
            start: isoDateString,
          },
        },
        Notifica_Inviata: {
          checkbox: false,
        },
      },
    })

    // Costruisci il link diretto alla riga di Notion
    const notionPageUrl = (response as any).url || `https://www.notion.so/${response.id.replace(/-/g, "")}`

    // Invia la notifica via email tramite SMTP
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const emailTo = process.env.NOTIFICATION_EMAIL_TO
    const emailFrom = process.env.NOTIFICATION_EMAIL_FROM || smtpUser

    if (smtpHost && smtpPort && smtpUser && smtpPass && emailTo) {
      try {
        const nodemailer = require("nodemailer")
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpPort === "465", // true per porta SMTPS 465, false per altre
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        })

        const mailOptions = {
          from: emailFrom,
          to: emailTo,
          subject: `🐝 Nuovo Ordine Ricevuto - ${name}`,
          text: `Nuovo ordine ricevuto dal sito Bee Coop!\n\n` +
                `DATI CLIENTE:\n` +
                `- Nome: ${name}\n` +
                `- Email: ${email}\n` +
                `- Telefono: ${phone}\n` +
                `- Indirizzo di Consegna: ${address || "Non specificato"}\n\n` +
                `DETTAGLIO ORDINE:\n` +
                `${prodottiDettaglio}\n\n` +
                `TOTALE CALCOLATO: €${parseFloat(total).toFixed(2)}\n` +
                `NOTE CLIENTE: ${notes || "Nessuna nota"}\n\n` +
                `-----------------------------------------\n` +
                `🔗 GESTISCI ORDINE SU NOTION:\n` +
                `${notionPageUrl}\n`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #2487ce; font-family: serif; margin-top: 0;">🐝 Nuovo Ordine Ricevuto</h2>
              <p style="color: #475569; font-size: 14px;">È stato registrato un nuovo ordine sul sito <strong>Bee Coop</strong>.</p>
              
              <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; color: #1e293b; font-size: 16px;">Dati Cliente</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; width: 140px;">Nome:</td>
                  <td style="padding: 4px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #2487ce; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Telefono:</td>
                  <td style="padding: 4px 0;"><a href="tel:${phone}" style="color: #2487ce; text-decoration: none;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Indirizzo di Spedizione:</td>
                  <td style="padding: 4px 0;">${address || "<em>Non specificato</em>"}</td>
                </tr>
              </table>
              
              <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; color: #1e293b; font-size: 16px; margin-top: 20px;">Dettaglio Prodotti</h3>
              <pre style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: monospace; white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #334155; margin: 10px 0;">${prodottiDettaglio}</pre>
              
              <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin-top: 15px;">Totale Ordine: <span style="color: #2487ce;">€${parseFloat(total).toFixed(2)}</span></p>
              
              <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; color: #1e293b; font-size: 16px; margin-top: 20px;">Note Cliente</h3>
              <p style="font-style: italic; color: #475569; font-size: 13px; background-color: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #cbd5e1;">${notes || "Nessuna nota aggiuntiva."}</p>
              
              <div style="margin-top: 30px; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 20px;">
                <a href="${notionPageUrl}" target="_blank" style="background-color: #2487ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 12px rgba(36,135,206,0.25);">
                  Gestisci Ordine su Notion
                </a>
              </div>
            </div>
          `,
        }

        await transporter.sendMail(mailOptions)
        console.log("Notifica email inviata con successo a:", emailTo)

        // Aggiorna lo stato in Notion per indicare che la notifica è stata inviata
        try {
          await notion.pages.update({
            page_id: response.id,
            properties: {
              Notifica_Inviata: {
                checkbox: true,
              },
            },
          })
          console.log("Flag Notifica_Inviata aggiornato a true su Notion.")
        } catch (updateError) {
          console.error("Errore durante l'aggiornamento del flag Notifica_Inviata su Notion:", updateError)
        }
      } catch (emailError) {
        console.error("Errore durante l'invio dell'email di notifica:", emailError)
      }
    } else {
      console.warn("Variabili d'ambiente SMTP non configurate. Notifica email saltata.")
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Errore durante il salvataggio dell'ordine su Notion:", error)
    return NextResponse.json(
      { error: "Errore interno durante il salvataggio su Notion.", details: error.message },
      { status: 500 }
    )
  }
}
