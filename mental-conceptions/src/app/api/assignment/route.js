import { NextResponse } from "next/server";
import connectMongoDB from "../../libs/mongodb";
import Participant from "../../models/participant";
import {
  getConditionSequenceForParticipant,
  TASK_COUNT,
} from "../../sketch/prompts";

const STUDY_VERSION = "fixed-condition-B";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongoDB();

/*   const completedCount = await Participant.countDocuments({
    studyVersion: STUDY_VERSION,
  }); */

  // const participantNumber = completedCount + 1;
  const participantNumber = 2; // always assign condition B
  const conditionSequence = getConditionSequenceForParticipant(
    participantNumber
  );

  return NextResponse.json({
    studyVersion: STUDY_VERSION,
    participantNumber,
    taskCount: TASK_COUNT,
    conditionSequence,
  });
}
