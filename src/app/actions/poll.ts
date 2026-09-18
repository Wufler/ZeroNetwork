"use server";

import { and, count, desc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { polls, pollVotes } from "@/db/schema";
import { hashIdentifier } from "@/lib/fingerprint";
import { sendWebhook } from "@/lib/webhook";

export async function getAllPolls() {
  const [allPolls, voteCounts] = await Promise.all([
    db.select().from(polls).orderBy(desc(polls.createdAt)),
    db
      .select({ pollId: pollVotes.pollId, count: count() })
      .from(pollVotes)
      .groupBy(pollVotes.pollId),
  ]);
  const counts = new Map(voteCounts.map((item) => [item.pollId, item.count]));
  return allPolls.map((poll) => ({
    ...poll,
    _count: { pollVotes: counts.get(poll.id) ?? 0 },
  }));
}

export async function createNewPoll(
  question: string,
  answers: string[],
  until?: Date,
) {
  const [poll] = await db
    .insert(polls)
    .values({
      question,
      answers,
      votes: new Array(answers.length).fill(0),
      visible: false,
      until: until ?? null,
    })
    .returning();

  await sendWebhook({
    embeds: [
      {
        title: "New Poll Created",
        description: question,
        color: 0x00ff00,
        fields: answers.map((answer, index) => ({
          name: `Option ${index + 1}`,
          value: answer,
          inline: true,
        })),
        footer: until
          ? { text: `Ends at: ${until.toLocaleString()}` }
          : undefined,
        timestamp: new Date().toISOString(),
      },
    ],
  });
  return poll;
}

export async function togglePollVisibility(id: number, visible: boolean) {
  const [poll] = await db
    .update(polls)
    .set({ visible })
    .where(eq(polls.id, id))
    .returning();
  return poll;
}

export async function deletePoll(id: number) {
  const poll = await db.query.polls.findFirst({ where: eq(polls.id, id) });
  if (!poll) throw new Error("Poll not found");

  const deleted = await db.transaction(async (tx) => {
    await tx.delete(pollVotes).where(eq(pollVotes.pollId, id));
    const [result] = await tx.delete(polls).where(eq(polls.id, id)).returning();
    return result;
  });

  await sendWebhook({
    embeds: [
      {
        title: "Poll Deleted",
        description: poll.question,
        color: 0xff0000,
        fields: poll.answers.map((answer, index) => ({
          name: `Option ${index + 1}`,
          value: `${answer} (${poll.votes[index]} vote${poll.votes[index] === 1 ? "" : "s"})`,
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  });
  return deleted;
}

export async function endPoll(id: number) {
  const [poll] = await db
    .update(polls)
    .set({ endedAt: new Date(), visible: false })
    .where(eq(polls.id, id))
    .returning();
  if (!poll) throw new Error("Poll not found");

  const totalVotes = poll.votes.reduce((sum, current) => sum + current, 0);
  const votePercentages = poll.votes.map((votes) =>
    totalVotes === 0 ? "0.0" : ((votes / totalVotes) * 100).toFixed(1),
  );
  await sendWebhook({
    embeds: [
      {
        title: "Poll Ended",
        description: poll.question,
        color: 0xffd700,
        fields: poll.answers.map((answer, index) => ({
          name: `Option ${index + 1}`,
          value: `${answer}\n${poll.votes[index]} vote${poll.votes[index] === 1 ? "" : "s"} ${poll.votes[index] > 0 ? `(${votePercentages[index]}%)` : ""}`,
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  });
  return poll;
}

async function getVoterHashes(fingerprint: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  return {
    ipHash: hashIdentifier(ip),
    fingerprintHash: hashIdentifier(fingerprint),
  };
}

export async function hasVoted(pollId: number, fingerprint: string) {
  const { ipHash, fingerprintHash } = await getVoterHashes(fingerprint);
  const vote = await db.query.pollVotes.findFirst({
    where: and(
      eq(pollVotes.pollId, pollId),
      or(
        eq(pollVotes.ipHash, ipHash),
        eq(pollVotes.fingerprint, fingerprintHash),
      ),
    ),
  });
  return !!vote;
}

export async function vote(
  pollId: number,
  optionIndex: number,
  fingerprint: string,
) {
  const poll = await db.query.polls.findFirst({ where: eq(polls.id, pollId) });
  if (!poll) throw new Error("Poll not found");
  if (optionIndex < 0 || optionIndex >= poll.answers.length)
    throw new Error("Invalid option");
  if (poll.endedAt) throw new Error("This poll has ended");
  if (poll.until && new Date() > poll.until) {
    await endPoll(pollId);
    throw new Error("This poll has expired");
  }

  const { ipHash, fingerprintHash } = await getVoterHashes(fingerprint);
  const existingVote = await db.query.pollVotes.findFirst({
    where: and(
      eq(pollVotes.pollId, pollId),
      or(
        eq(pollVotes.ipHash, ipHash),
        eq(pollVotes.fingerprint, fingerprintHash),
      ),
    ),
  });
  if (existingVote) throw new Error("You can only vote once on each poll");

  const newVotes = [...poll.votes];
  newVotes[optionIndex] += 1;
  const updatedPoll = await db.transaction(async (tx) => {
    await tx.insert(pollVotes).values({
      pollId,
      ipHash,
      fingerprint: fingerprintHash,
      votedOption: optionIndex,
    });
    const [result] = await tx
      .update(polls)
      .set({ votes: newVotes })
      .where(eq(polls.id, pollId))
      .returning();
    return result;
  });

  const totalVotes = newVotes.reduce((sum, current) => sum + current, 0);
  const votePercentages = newVotes.map((votes) =>
    ((votes / totalVotes) * 100).toFixed(1),
  );
  await sendWebhook({
    embeds: [
      {
        title: "New Vote Received",
        description: poll.question,
        color: 0x3498db,
        fields: poll.answers.map((answer, index) => ({
          name: `${answer}${index === optionIndex ? " ✨" : ""}`,
          value: `${newVotes[index]} vote${newVotes[index] === 1 ? "" : "s"} (${votePercentages[index]}%)`,
          inline: true,
        })),
        footer: { text: `Total votes: ${totalVotes}` },
        timestamp: new Date().toISOString(),
      },
    ],
  });
  return updatedPoll;
}
