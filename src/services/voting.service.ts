import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export const voteTool = async (
  toolId: string,
  userId: string,
  voteType: 'helpful' | 'notHelpful'
) => {
  try {
    const toolRef = doc(db, 'tools', toolId);
    
    // تحديث مصفوفات التصويت
    await updateDoc(toolRef, {
      [`votes.${voteType}`]: arrayUnion(userId),
      [`votes.${voteType === 'helpful' ? 'notHelpful' : 'helpful'}`]: arrayRemove(userId)
    });

    // تحديث إحصائيات التصويت
    await updateDoc(toolRef, {
      'votingStats.helpfulCount': (voteType === 'helpful' ? 1 : -1),
      'votingStats.notHelpfulCount': (voteType === 'notHelpful' ? 1 : -1),
      'votingStats.totalVotes': 1
    });

    return true;
  } catch (error) {
    console.error('Error voting for tool:', error);
    return false;
  }
};
