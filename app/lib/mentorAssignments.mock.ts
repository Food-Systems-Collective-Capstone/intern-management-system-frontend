export type Mentor = {
  id: string;
  name: string;
  email: string;
};

export type AssignableIntern = {
  id: string;
  name: string;
  email: string;
  program: string;
  mentorId: string | null;
};

const mentors: Mentor[] = [
  {
    id: "mentor-jun",
    name: "Jun Hao Bai",
    email: "junhaobai@email.com",
  },
  {
    id: "mentor-jerose",
    name: "Jerose Aban",
    email: "jeroseaban@email.com",
  },
];

let interns: AssignableIntern[] = [
  {
    id: "intern-bob",
    name: "Bob Jones",
    email: "bobjones@email.com",
    program: "Business and Operations",
    mentorId: null,
  },
  {
    id: "intern-taylor",
    name: "Taylor Morgan",
    email: "taylormorgan@email.com",
    program: "IT Quality Assurance",
    mentorId: "mentor-jerose",
  },
  {
    id: "intern-casey",
    name: "Casey Brown",
    email: "caseybrown@email.com",
    program: "Food Science & Technology",
    mentorId: "mentor-jun",
  },
];

function mockDelay() {
  return new Promise((resolve) => window.setTimeout(resolve, 250));
}

export async function fetchMentorAssignmentData() {
  await mockDelay();
  return {
    interns: interns.map((intern) => ({ ...intern })),
    mentors: mentors.map((mentor) => ({ ...mentor })),
  };
}

export async function assignMentor(internId: string, mentorId: string) {
  await mockDelay();

  const intern = interns.find((item) => item.id === internId);
  const mentor = mentors.find((item) => item.id === mentorId);

  if (!intern) throw new Error("The selected intern could not be found.");
  if (!mentor) throw new Error("Please select a valid mentor.");

  const updatedIntern = { ...intern, mentorId };
  interns = interns.map((item) =>
    item.id === internId ? updatedIntern : item,
  );

  return { intern: updatedIntern, mentor: { ...mentor } };
}
