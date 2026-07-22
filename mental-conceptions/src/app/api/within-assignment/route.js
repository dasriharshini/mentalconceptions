export const dynamic = "force-dynamic";

import Participant from "../../models/participant";
import connectMongoDB from "../../libs/mongodb";
import { NextResponse } from "next/server";
import {
  createWithinSubjectAssignment,
  WITHIN_STUDY_VERSION,
} from "../../libs/withinSubject";

export async function GET() {
  await connectMongoDB();

  const completedCount = await Participant.countDocuments({
    studyVersion: WITHIN_STUDY_VERSION,
    studyStatus: "completed",
  });

  const participantNumber = completedCount + 1;
  const assignment = createWithinSubjectAssignment(participantNumber);

  return NextResponse.json(assignment);
}
