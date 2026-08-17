/**
 * Returns true only if a property has been explicitly approved by the Admin.
 * Matches the User Portal logic — only 'active', 'approved', or 'published' pass.
 * Properties with no status, 'pending', 'rejected', 'archived', 'deleted' are hidden.
 */
export function isActiveProperty(property: { status?: string }) {
  if (!property) return false;
  // If no status set at all, hide (requires Admin to explicitly approve)
  if (!property.status) return false;
  const status = String(property.status).toLowerCase().trim();
  return status === 'active' || status === 'approved' || status === 'published';
}
