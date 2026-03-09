export function exportMetadata({ projectId, type, paymentReference }) {
  return { projectId, type, paymentReference, generatedAt: new Date().toISOString(), secure: true };
}
