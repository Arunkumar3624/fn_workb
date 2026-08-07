// Mirrors schema.sql's education_level enum exactly — shared between
// WorkerJobFeed.jsx (job card Qualifications chip) and JobFilters.jsx
// (the education filter) so both read from one source of truth, and
// neither has to import the other (which would create a circular import).
export const EDUCATION_LABELS = {
  HIGH_SCHOOL: "High School",
  DIPLOMA: "Diploma",
  BACHELORS: "Bachelor's Degree",
  MASTERS: "Master's Degree",
  PHD: "PhD",
};
