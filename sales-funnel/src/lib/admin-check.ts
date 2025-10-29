import type { WhopAccess } from "~/lib/whop";

export function isAdmin(access: WhopAccess): boolean {
	// Check if user has admin or owner access level
	return access.accessLevel === "admin" || access.accessLevel === "owner";
}

export function requireAdmin(access: WhopAccess): void {
	if (!isAdmin(access)) {
		throw new Error("Admin access required");
	}
}

