import { z } from "zod"

export const jobStatusSchema = z.enum([
    "SAVED",
    "REVIEW",
    "APPLIED",
    "REJECTED",
    "ARCHIVED",
    "ACCEPTED",
]);

export const recruiterSchema = z.object({
    id: z
        .string()
        .optional()
        .describe("Existing recruiter ID. Include it only when updating an existing recruiter."),
    name: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    email: z.string().email().optional(),
    link: z.string().url().optional(),
    sourceUrl: z
        .string()
        .url()
        .optional()
        .describe("Page where this recruiter information was found."),
    notes: z.string().optional(),
    verificationStatus: z
        .enum(["UNVERIFIED", "VERIFIED"])
        .default("UNVERIFIED"),
});

export const researchSourceSchema = z.object({
    url: z.string().url(),
    title: z.string().optional(),
    accessedAt: z.string().optional(),
});

export const createJobSchema = z.object({
    company: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    applyLink: z.string().url().optional(),
    detailsUrl: z.string().url().optional(),
    source: z.string().optional(),
    location: z.string().optional(),
    salary: z.string().optional(),
    description: z.string().optional(),
    personalNotes: z.string().optional(),
    companyWebsite: z.string().url().optional(),
    companyLinkedin: z.string().url().optional(),
    companyX: z.string().url().optional(),
    requirements: z.array(z.string()).optional(),
    resumeVersion: z.string().optional(),
    recruiters: z.array(recruiterSchema).optional(),
});

export const updateJobSchema = z.object({
    id: z.string().min(1),
    company: z.string().min(1).optional(),
    title: z.string().nullable().optional(),
    applyLink: z.string().url().nullable().optional(),
    detailsUrl: z.string().url().nullable().optional(),
    source: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    salary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    personalNotes: z.string().nullable().optional(),
    companyWebsite: z.string().url().nullable().optional(),
    companyLinkedin: z.string().url().nullable().optional(),
    companyX: z.string().url().nullable().optional(),
    resumeVersion: z.string().nullable().optional(),
    status: jobStatusSchema.optional(),
    fitScore: z.number().int().min(0).max(100).optional(),
    matchReason: z.string().nullable().optional(),
    requirements: z.array(z.string()).nullable().optional(),
    missingSkills: z.array(z.string()).nullable().optional(),
    researchSources: z.array(researchSourceSchema).nullable().optional(),
    recruiters: z.array(recruiterSchema).optional(),
});

