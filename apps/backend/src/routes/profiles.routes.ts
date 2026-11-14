import express, { type Request, type Response, type Router } from "express";
import { db, JobVisibility, Prisma, ProfileVoteType } from "@repo/db";
import { optionalAuth, requireAuth, type AuthenticatedRequest } from "../auth/require-auth.js";

const profileRouter: Router = express.Router();

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
}

function voteTypeValue(value: unknown): ProfileVoteType | null | undefined {
  if (value === null) return null;
  const vote = stringValue(value)?.toUpperCase();
  return vote && Object.values(ProfileVoteType).includes(vote as ProfileVoteType)
    ? vote as ProfileVoteType
    : undefined;
}

profileRouter.get("/me", requireAuth, async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) {
    response.status(404).json({ error: "Profile not found" });
    return;
  }
  response.json({ data: profile });
});

profileRouter.patch("/me", requireAuth, async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const data: Prisma.ProfileUpdateInput = {};
  const textFields = ["displayName", "headline", "bio", "location", "website"] as const;

  for (const field of textFields) {
    if (field in request.body) {
      const value = nullableString(request.body[field]);
      if (value !== undefined) data[field] = value;
    }
  }

  if ("handle" in request.body) {
    const handle = stringValue(request.body.handle)?.toLowerCase();
    if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
      response.status(400).json({ error: "Handle can only use lowercase letters, numbers, and hyphens" });
      return;
    }
    data.handle = handle;
  }

  if ("isPublic" in request.body) {
    if (typeof request.body.isPublic !== "boolean") {
      response.status(400).json({ error: "isPublic must be a boolean" });
      return;
    }
    data.isPublic = request.body.isPublic;
  }

  if (!Object.keys(data).length) {
    response.status(400).json({ error: "No valid profile fields provided" });
    return;
  }

  try {
    const profile = await db.profile.update({ where: { userId }, data });
    response.json({ data: profile });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      response.status(409).json({ error: "That profile handle is already taken" });
      return;
    }
    response.status(500).json({ error: "Unable to update profile" });
  }
});

profileRouter.post("/:handle/jobs/:jobId/share", async (request: Request, response: Response) => {
  const handle = stringValue(request.params.handle)?.toLowerCase();
  const jobId = stringValue(request.params.jobId);
  if (!handle || !jobId) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  const profile = await db.profile.findUnique({ where: { handle }, select: { userId: true, isPublic: true } });
  if (!profile?.isPublic) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  const job = await db.job.findFirst({
    where: { id: jobId, ownerId: profile.userId, visibility: JobVisibility.PROFILE },
    select: { id: true },
  });
  if (!job) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  const existingLink = await db.shareLink.findFirst({
    where: {
      type: "JOB",
      jobId: job.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
  const shareLink = existingLink ?? await db.shareLink.create({
    data: { type: "JOB", userId: profile.userId, jobId: job.id },
  });
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3001";
  response.json({ data: { url: `${frontendUrl}/share/jobs/${shareLink.token}` } });
});

profileRouter.post("/:handle/vote", requireAuth, async (request: Request, response: Response) => {
  const handle = stringValue(request.params.handle)?.toLowerCase();
  const voterId = (request as AuthenticatedRequest).userId;
  const vote = voteTypeValue(request.body.vote);

  if (!handle) {
    response.status(404).json({ error: "Profile not found" });
    return;
  }
  if (vote === undefined) {
    response.status(400).json({ error: "vote must be UPVOTE, DOWNVOTE, or null" });
    return;
  }

  try {
    const result = await updateProfileVote(handle, voterId, vote);
    if (!result) {
      response.status(404).json({ error: "Profile not found" });
      return;
    }
    response.json({ data: result });
  } catch (error) {
    console.error("Failed to update profile vote", error);
    response.status(500).json({ error: "Unable to update profile vote" });
  }
});

profileRouter.get("/:handle", optionalAuth, async (request: Request, response: Response) => {
  const handle = stringValue(request.params.handle)?.toLowerCase();
  if (!handle) {
    response.status(404).json({ error: "Profile not found" });
    return;
  }

  const profile = await db.profile.findUnique({
    where: { handle },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          createdAt: true,
          jobs: {
            where: { visibility: JobVisibility.PROFILE },
            orderBy: { createdAt: "desc" },
            include: { recruiters: true },
          },
        },
      },
    },
  });

  const viewerId = (request as Partial<AuthenticatedRequest>).userId;
  if (!profile || (!profile.isPublic && profile.userId !== viewerId)) {
    response.status(404).json({ error: "Profile not found" });
    return;
  }

  const jobs = profile.user.jobs.map(({ personalNotes: _personalNotes, ...job }) => job);
  const viewerVote = viewerId
    ? await db.profileVote.findUnique({
        where: { voterId_profileId: { voterId: viewerId, profileId: profile.id } },
        select: { type: true },
      })
    : null;
  response.json({
    data: {
      profile: {
        displayName: profile.displayName,
        handle: profile.handle,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        isPublic: profile.isPublic,
        image: profile.user.image,
        joinedAt: profile.user.createdAt,
        upvote: profile.upvote,
        downvote: profile.downvote,
        viewerVote: viewerVote?.type ?? null,
      },
      jobs,
    },
  });
});

async function updateProfileVote(handle: string, voterId: string, vote: ProfileVoteType | null) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.$transaction(async (transaction) => {
        const profile = await transaction.profile.findUnique({
          where: { handle },
          select: { id: true, userId: true, isPublic: true },
        });
        if (!profile || (!profile.isPublic && profile.userId !== voterId)) return null;

        const existing = await transaction.profileVote.findUnique({
          where: { voterId_profileId: { voterId, profileId: profile.id } },
          select: { id: true, type: true },
        });

        if (existing?.type === vote) {
          return currentVoteSummary(transaction, profile.id, existing.type);
        }

        if (existing) {
          if (vote === null) {
            await transaction.profileVote.delete({ where: { id: existing.id } });
          } else {
            await transaction.profileVote.update({ where: { id: existing.id }, data: { type: vote } });
          }
        } else if (vote !== null) {
          await transaction.profileVote.create({ data: { voterId, profileId: profile.id, type: vote } });
        }

        const [upvote, downvote] = await Promise.all([
          transaction.profileVote.count({ where: { profileId: profile.id, type: ProfileVoteType.UPVOTE } }),
          transaction.profileVote.count({ where: { profileId: profile.id, type: ProfileVoteType.DOWNVOTE } }),
        ]);
        await transaction.profile.update({ where: { id: profile.id }, data: { upvote, downvote } });

        return { upvote, downvote, viewerVote: vote };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!isPrismaError(error, "P2034") || attempt === 2) throw error;
    }
  }
  throw new Error("Unable to update profile vote");
}

async function currentVoteSummary(
  transaction: Prisma.TransactionClient,
  profileId: string,
  viewerVote: ProfileVoteType,
) {
  const profile = await transaction.profile.findUniqueOrThrow({
    where: { id: profileId },
    select: { upvote: true, downvote: true },
  });
  return { ...profile, viewerVote };
}

function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

export default profileRouter;
