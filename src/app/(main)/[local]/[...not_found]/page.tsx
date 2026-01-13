import { notFound } from 'next/navigation';

// Catch-all route to trigger 404 for unmatched paths
export default function CatchAll() {
  notFound();
}
