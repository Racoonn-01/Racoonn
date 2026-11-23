import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'DUMMY_KEY' });

export async function POST(req: Request) {
  try {
    const { message, propertyData, previousInteractionId } = await req.json();

    const systemInstruction = `You are the AI assistant for a hotel listed on our OTA platform. Answer user questions only using the provided property listing data for the selected hotel.
Before answering, correct obvious spelling mistakes, expand abbreviations, and interpret Hindi/Hinglish queries into the relevant hotel attribute.
If the answer is available in the listing, reply clearly and briefly in the user's language, mentioning only verified details such as amenities, room options, pricing, policies, location, facilities, check-in/check-out time, and nearby attractions.
If the requested information is not present in the property data, say: "This detail is not currently available for this property. Please contact the hotel or our support team."
Never guess prices, availability, distances, ratings, policies, or services. Never recommend another hotel unless the user explicitly asks for alternatives.
If the query is about booking, payment, dates, or number of guests, guide the user to the booking section and do not confirm availability yourself.

PROPERTY DATA:
${JSON.stringify(propertyData, null, 2)}`;

    const requestBody: any = {
      model: "gemini-3.6-flash",
      input: message,
      system_instruction: systemInstruction,
    };
    
    if (previousInteractionId) {
       requestBody.previous_interaction_id = previousInteractionId;
    }

    const interaction = await ai.interactions.create(requestBody);

    return NextResponse.json({
      text: interaction.output_text,
      interactionId: interaction.id
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 });
  }
}
