import { clerkClient } from "@clerk/nextjs/server";

/**
 * Company logos live on the tenant's Clerk Organization (uploaded at creation or from Clerk).
 * Returns clerkOrgId -> logo URL, or null when the org has no image (callers show the initial).
 */
export async function getOrgLogos(clerkOrgIds: string[]): Promise<Record<string, string | null>> {
  if (clerkOrgIds.length === 0) return {};
  const client = await clerkClient();
  const entries = await Promise.all(
    clerkOrgIds.map(async (id) => {
      try {
        const org = await client.organizations.getOrganization({ organizationId: id });
        return [id, org.hasImage ? org.imageUrl : null] as const;
      } catch {
        return [id, null] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}
