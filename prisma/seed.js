const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const templates = [
  {
    scenario: "PERFORMANCE",
    name: "Performance Conversation Starter",
    body: "Opening, factual examples, impact, support offer, measurable expectations, and review dates."
  },
  {
    scenario: "PERFORMANCE",
    name: "Improvement Plan Template",
    body: "Objective, success metric, support actions, check-in cadence, and review outcome fields."
  },
  {
    scenario: "CONDUCT",
    name: "Conduct Discussion Framework",
    body: "Describe observed behavior, request response, confirm standards, and document follow-up actions."
  },
  {
    scenario: "CONDUCT",
    name: "Conduct Follow-up Email",
    body: "Summarize key points, expectations, and next checkpoint in neutral language."
  },
  {
    scenario: "SICKNESS_ABSENCE",
    name: "Return to Work Check-in",
    body: "Absence timeline, wellbeing check, support options, and phased return discussion prompts."
  },
  {
    scenario: "GRIEVANCE",
    name: "Grievance Intake Notes",
    body: "Issue summary, dates/examples, witnesses, desired resolution, and immediate actions."
  },
  {
    scenario: "CONFLICT",
    name: "Mediation Agenda",
    body: "Ground rules, impact statements, options, commitments, and follow-up review points."
  },
  {
    scenario: "FLEXIBLE_WORKING",
    name: "Flexible Working Assessment",
    body: "Business impact, alternatives considered, decision rationale, and review timeline fields."
  }
];

async function main() {
  await prisma.template.deleteMany();

  for (const template of templates) {
    await prisma.template.create({ data: template });
  }

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      disclaimerAccepted: false,
      orgPolicyText: null
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
