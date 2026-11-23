/**
 * Returns true only if a property is a genuine, approved property listing.
 * Excludes internal CMS system documents (e.g. cms_invoices_v1, cms_packages_v1, CMS Invoices Storage).
 * Matches the User Portal logic — only 'active', 'approved', or 'published' pass.
 */
export function isActiveProperty(property: {
  status?: string;
  name?: string;
  title?: string;
  propertyName?: string;
  $id?: string;
  id?: string;
}) {
  if (!property) return false;

  const id = String(property.$id || property.id || '').toLowerCase().trim();
  const name = String(property.name || property.title || property.propertyName || '').toLowerCase().trim();

  // 🛑 Exclude internal CMS data storage documents in the properties collection
  if (
    id.startsWith('cms_') ||
    id.includes('invoices') ||
    id.includes('popular_stays') ||
    name.startsWith('cms') ||
    name.includes('cms invoices') ||
    name.includes('invoices storage') ||
    name.includes('cms storage')
  ) {
    return false;
  }

  // If no status set at all, hide
  if (!property.status) return false;
  const status = String(property.status).toLowerCase().trim();
  return status === 'active' || status === 'approved' || status === 'published';
}
