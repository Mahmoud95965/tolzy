import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { toolId, voteType, userId } = body;

        if (!toolId || !voteType || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['helpful', 'notHelpful'].includes(voteType)) {
            return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const toolRef = adminDb.collection('tools').doc(toolId);
        const voteRef = toolRef.collection('votes').doc(userId);

        await adminDb.runTransaction(async (transaction) => {
            const toolDoc = await transaction.get(toolRef);
            const voteDoc = await transaction.get(voteRef);

            if (!toolDoc.exists) {
                throw new Error('Tool not found');
            }

            const currentStats = toolDoc.data()?.votingStats || {
                helpfulCount: 0,
                notHelpfulCount: 0,
                totalVotes: 0
            };

            let newHelpful = currentStats.helpfulCount || 0;
            let newNotHelpful = currentStats.notHelpfulCount || 0;

            if (voteDoc.exists) {
                const existingVote = voteDoc.data();
                if (existingVote?.voteType === voteType) {
                    // Toggle OFF (remove vote)
                    if (voteType === 'helpful') newHelpful--;
                    else newNotHelpful--;

                    transaction.delete(voteRef);
                } else {
                    // Change vote
                    if (voteType === 'helpful') {
                        newHelpful++;
                        newNotHelpful--;
                    } else {
                        newHelpful--;
                        newNotHelpful++;
                    }

                    transaction.set(voteRef, {
                        voteType,
                        userId,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
            } else {
                // New vote
                if (voteType === 'helpful') newHelpful++;
                else newNotHelpful++;

                transaction.set(voteRef, {
                    voteType,
                    userId,
                    createdAt: FieldValue.serverTimestamp()
                });
            }

            // Ensure no negatives
            newHelpful = Math.max(0, newHelpful);
            newNotHelpful = Math.max(0, newNotHelpful);

            transaction.update(toolRef, {
                votingStats: {
                    helpfulCount: newHelpful,
                    notHelpfulCount: newNotHelpful,
                    totalVotes: newHelpful + newNotHelpful
                }
            });
        });

        const updatedTool = await toolRef.get();
        const newStats = updatedTool.data()?.votingStats;

        return NextResponse.json({ success: true, votingStats: newStats });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Vote transaction failed:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('❌ Vote transaction failed (unknown error):', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
