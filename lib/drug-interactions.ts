export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

// Common drug interactions database for demo purposes
export const KNOWN_INTERACTIONS: DrugInteraction[] = [
  {
    drug1: "lisinopril",
    drug2: "ibuprofen",
    severity: "high",
    description: "NSAIDs like ibuprofen can reduce the effectiveness of ACE inhibitors (lisinopril) and increase risk of kidney damage.",
    recommendation: "Consider alternative pain management. Monitor renal function if co-administration is necessary.",
  },
  {
    drug1: "lisinopril",
    drug2: "potassium",
    severity: "high",
    description: "ACE inhibitors increase potassium levels. Supplemental potassium can cause dangerous hyperkalemia.",
    recommendation: "Monitor serum potassium levels closely. Avoid potassium supplements unless directed.",
  },
  {
    drug1: "metformin",
    drug2: "alcohol",
    severity: "medium",
    description: "Alcohol increases the risk of lactic acidosis when combined with metformin.",
    recommendation: "Limit alcohol consumption. Monitor for symptoms of lactic acidosis.",
  },
  {
    drug1: "warfarin",
    drug2: "aspirin",
    severity: "high",
    description: "Combined use significantly increases bleeding risk.",
    recommendation: "Avoid combination unless specifically indicated. Monitor INR closely.",
  },
  {
    drug1: "omeprazole",
    drug2: "clopidogrel",
    severity: "high",
    description: "Omeprazole reduces the antiplatelet effect of clopidogrel, increasing cardiovascular risk.",
    recommendation: "Consider pantoprazole as alternative PPI if acid suppression needed.",
  },
  {
    drug1: "atorvastatin",
    drug2: "grapefruit",
    severity: "medium",
    description: "Grapefruit inhibits CYP3A4, increasing statin levels and risk of muscle damage.",
    recommendation: "Avoid large quantities of grapefruit. Monitor for muscle pain.",
  },
  {
    drug1: "metformin",
    drug2: "ibuprofen",
    severity: "medium",
    description: "NSAIDs may impair renal function, affecting metformin clearance and increasing lactic acidosis risk.",
    recommendation: "Use with caution. Monitor renal function.",
  },
  {
    drug1: "lisinopril",
    drug2: "spironolactone",
    severity: "high",
    description: "Both drugs increase potassium levels, risking dangerous hyperkalemia.",
    recommendation: "Monitor potassium levels frequently if combination is necessary.",
  },
];

// Sulfa-based drugs for allergy checking
export const SULFA_DRUGS = [
  "bactrim",
  "sulfamethoxazole",
  "trimethoprim-sulfamethoxazole",
  "sulfasalazine",
  "dapsone",
  "sulfadiazine",
];

// Penicillin-class drugs for allergy checking
export const PENICILLIN_DRUGS = [
  "amoxicillin",
  "ampicillin",
  "penicillin",
  "augmentin",
  "amoxicillin-clavulanate",
  "piperacillin",
  "nafcillin",
  "dicloxacillin",
];

export function checkDrugInteractions(
  newDrug: string,
  currentMedications: string[]
): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  const normalizedNew = newDrug.toLowerCase();

  for (const currentMed of currentMedications) {
    const normalizedCurrent = currentMed.toLowerCase();

    for (const interaction of KNOWN_INTERACTIONS) {
      const d1 = interaction.drug1.toLowerCase();
      const d2 = interaction.drug2.toLowerCase();

      if (
        (normalizedNew.includes(d1) && normalizedCurrent.includes(d2)) ||
        (normalizedNew.includes(d2) && normalizedCurrent.includes(d1))
      ) {
        interactions.push(interaction);
      }
    }
  }

  return interactions;
}

export function checkAllergyConflict(
  drug: string,
  allergies: string[]
): { isConflict: boolean; allergen: string; description: string } | null {
  const normalizedDrug = drug.toLowerCase();

  for (const allergy of allergies) {
    const normalizedAllergy = allergy.toLowerCase();

    // Check sulfa allergy
    if (normalizedAllergy.includes("sulfa")) {
      if (SULFA_DRUGS.some((sd) => normalizedDrug.includes(sd))) {
        return {
          isConflict: true,
          allergen: "sulfa",
          description: `${drug} is a sulfa-based medication. Patient has documented sulfa allergy.`,
        };
      }
    }

    // Check penicillin allergy
    if (normalizedAllergy.includes("penicillin")) {
      if (PENICILLIN_DRUGS.some((pd) => normalizedDrug.includes(pd))) {
        return {
          isConflict: true,
          allergen: "penicillin",
          description: `${drug} is a penicillin-class antibiotic. Patient has documented penicillin allergy.`,
        };
      }
    }

    // Check aspirin allergy
    if (normalizedAllergy.includes("aspirin") && normalizedDrug.includes("aspirin")) {
      return {
        isConflict: true,
        allergen: "aspirin",
        description: `Patient has documented aspirin allergy. ${drug} should not be prescribed.`,
      };
    }
  }

  return null;
}
