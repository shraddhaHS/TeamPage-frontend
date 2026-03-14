export let INITIAL_TEAM = [
  {
    id: "ARM-001",
    name: "Marcus Reyes",
    role: "Lead Robotics Engineer",
    bio: "Marcus heads the core robotics platform at Armatrix, bringing 12 years of experience designing industrial automation systems. He holds a PhD in Mechatronics from MIT and has led robotics projects across four continents.",
    photo: "team_member_1.png",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    quote: "A robot that can adapt is worth a thousand that cannot.",
  },
  {
    id: "ARM-002",
    name: "Elena Voss",
    role: "Software Architecture Lead",
    bio: "Elena designs the software infrastructure that powers the Armatrix autonomy stack. She was previously at Boston Dynamics and DeepMind, contributing to perception and motion planning research.",
    photo: "team_member_2.png",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    quote: "Software is the nervous system of every great machine.",
  },
  {
    id: "ARM-003",
    name: "Prof. David Okafor",
    role: "Chief Technology Officer",
    bio: "David is a globally recognized authority in autonomous systems. With 20+ years in robotics research, he guides Armatrix's long-term technical vision and maintains academic partnerships with leading institutions worldwide.",
    photo: "team_member_3.png",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    quote: "Precision is not a feature — it is the foundation.",
  },
  {
    id: "ARM-004",
    name: "Priya Sharma",
    role: "AI Research Scientist",
    bio: "Priya leads the AI and machine learning division at Armatrix, with a focus on real-time scene understanding and robotic decision-making. Her research has been published in Nature Machine Intelligence and CVPR.",
    photo: "team_member_4.png",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    quote: "The goal of AI is not to replace human judgment — but to amplify it.",
  },
  {
    id: "ARM-005",
    name: "Kai Tanaka",
    role: "Mechanical Systems Engineer",
    bio: "Kai specializes in the mechanical design and stress analysis of robotic end effectors and articulated systems. His designs combine structural elegance with manufacturing precision, reducing assembly complexity by 40%.",
    photo: "team_member_5.png",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    quote: "Every joint, every bolt — intentional by design.",
  },
];

export function getMembers() {
  return INITIAL_TEAM;
}

export function addMember(member) {
  INITIAL_TEAM.push(member);
  return member;
}

export function updateMember(id, updatedFields) {
  const index = INITIAL_TEAM.findIndex((m) => m.id === id);
  if (index !== -1) {
    INITIAL_TEAM[index] = { ...INITIAL_TEAM[index], ...updatedFields };
    return INITIAL_TEAM[index];
  }
  return null;
}

export function deleteMember(id) {
  INITIAL_TEAM = INITIAL_TEAM.filter((m) => m.id !== id);
}
