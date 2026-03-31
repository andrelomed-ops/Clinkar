import { NextRequest, NextResponse } from 'next/server';
import { huggingFaceService } from '@/services/HuggingFaceService';

export async function POST(request: NextRequest) {
    try {
        const { messages, context } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages required' }, { status: 400 });
        }

        const response = await huggingFaceService.chat(messages);

        return NextResponse.json({ response });
    } catch (error) {
        console.error('[AI Chat API Error]:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'AI service unavailable' },
            { status: 500 }
        );
    }
}