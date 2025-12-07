// Helper functions to convert between SQLite strings and JSON objects

export function parseRFP(rfp: any) {
  return {
    ...rfp,
    // JSON fields are already parsed by Prisma with SQLite
  };
}

export function parseVendor(vendor: any) {
  return {
    ...vendor,
    // Category is now a simple string field
  };
}

export function parseProposal(proposal: any) {
  return {
    ...proposal,
    // JSON fields are already parsed by Prisma with SQLite
  };
}
