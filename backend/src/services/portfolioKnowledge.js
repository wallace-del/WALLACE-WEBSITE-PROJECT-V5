
import { prisma } from '../db.js';

export const fallbackProfile = {
  id: 1,
  name: 'Wallace Wambugu',
  role: 'BSc Information Technology student and software developer in training',
  location: 'Kenya',
  university: 'Kirinyaga University',
  studyPeriod: '2024 – Present',
  email: 'wallacewambugu174@gmail.com',
  githubProfile: 'https://github.com/wallace-del',
  githubRepo: 'https://github.com/wallace-del/portfolio-website',
  linkedin: 'https://www.linkedin.com/in/wallace-githae-53894242a',
  aboutHeadline: 'Learning by building systems that can be inspected.',
  aboutText:
    'I am a BSc Information Technology student focused on turning what I learn into practical software, information systems and digital tools. My portfolio is intentionally evidence-based: completed work is shown as completed, work in progress is labelled clearly, and future ideas remain future ideas.',
  heroFocus: [
    'Web Development',
    'Information Systems',
    'Databases',
    'IT Solutions',
    'AI-assisted Products'
  ],
  currentlyDeveloping: [
    'Web Development',
    'Databases',
    'Networking',
    'Graphic Design',
    'Video Editing',
    'Data Annotation',
    'Cloud Fundamentals',
    'Cybersecurity Fundamentals'
  ],
  skillGroups: [
    {
      title: 'Programming & Markup',
      items: ['HTML', 'CSS', 'JavaScript', 'SQL', 'Java', 'C++']
    },
    {
      title: 'Development Tools',
      items: ['Git', 'GitHub', 'VS Code', 'Android Studio']
    },
    {
      title: 'Databases',
      items: ['SQL', 'MySQL', 'MS Access', 'Data Modelling']
    },
    {
      title: 'Systems',
      items: ['Networking', 'Windows', 'Linux', 'IT Support']
    },
    {
      title: 'Currently Exploring',
      items: ['Cloud', 'Cybersecurity', 'AI', 'Automation', 'DevOps']
    }
  ],
  learningGroups: [
    {
      state: 'CURRENT',
      title: 'Building foundations through practice',
      items: ['Software Development', 'Databases', 'Networking']
    },
    {
      state: 'STRENGTHENING',
      title: 'Deepening practical capability',
      items: ['Web Development', 'Programming', 'Information Systems']
    },
    {
      state: 'EXPLORING',
      title: 'Expanding into emerging areas',
      items: ['Cybersecurity', 'Cloud', 'AI & Automation', 'DevOps']
    }
  ],
  availability: [
    'Internships',
    'IT Attachments',
    'Junior Development Opportunities',
    'Freelance Projects',
    'Remote Opportunities',
    'Technical Collaborations'
  ],
  languages: ['English', 'Swahili', 'Arabic']
};

const makeLink = (label, href) => ({ label, href });
const response = (text, links = []) => ({ text, links });

const flatten = groups =>
  Array.isArray(groups)
    ? groups.flatMap(group =>
        Array.isArray(group?.items) ? group.items : []
      )
    : [];

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9+#.\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text, phrases) {
  return phrases.some(phrase => text.includes(phrase));
}

function isGreeting(q) {
  return /^(hi|hello|hey|hiya|howdy|good morning|good afternoon|good evening|greetings|morning|afternoon|evening)( there)?[!. ]*$/.test(q);
}

function isThanks(q) {
  return /^(thanks|thank you|thank u|thx|many thanks|thanks a lot|much appreciated)[!. ]*$/.test(q);
}

function isGoodbye(q) {
  return /^(bye|goodbye|see you|see you later|talk later|have a good day|have a nice day|take care)[!. ]*$/.test(q);
}

function isSmallTalk(q) {
  return containsAny(q, [
    'how are you',
    'how are things',
    'how is it going',
    "what's up",
    'whats up',
    'who are you',
    'what can you do',
    'help me',
    'can you help'
  ]);
}

function lastUserQuestion(history) {
  if (!Array.isArray(history)) return '';
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];
    if (item?.role === 'user' && typeof item.content === 'string') {
      return normalize(item.content);
    }
  }
  return '';
}

function isFollowUp(q) {
  return /^(tell me more|more details|explain more|why|how so|what about it|what about that|and that|and it|which one|the first one|the second one|that one|it|they|them|its|their|what technologies does it use|what tech does it use|how can i do that|continue|go on)\b/.test(q);
}

function resolveQuestion(raw, history) {
  const q = normalize(raw);
  const previous = lastUserQuestion(history);

  if (!isFollowUp(q) || !previous) return q;

  if (/\b(project|built|portfolio|work)\b/.test(previous)) {
    return `${q} portfolio projects`;
  }

  if (/\b(technology|technologies|tech stack|programming|skills|language|tools)\b/.test(previous)) {
    return `${q} technologies skills`;
  }

  if (/\b(learn|learning|study|studying|exploring)\b/.test(previous)) {
    return `${q} learning areas`;
  }

  if (/\b(availability|available|internship|freelance|hire|attachment|opportunities)\b/.test(previous)) {
    return `${q} availability opportunities`;
  }

  if (/\b(contact|email|linkedin|github|reach)\b/.test(previous)) {
    return `${q} contact details`;
  }

  return q;
}

function scoreProject(project, q) {
  const name = normalize(project.name);
  const slug = normalize(String(project.slug || '').replaceAll('-', ' '));
  const words = [...new Set(`${name} ${slug}`.split(' ').filter(word => word.length > 2))];

  if (name && q.includes(name)) return 100;
  if (slug && q.includes(slug)) return 95;

  let score = 0;
  for (const word of words) {
    if (q.split(' ').includes(word)) score += 12;
  }

  const description = normalize(project.text);
  for (const word of q.split(' ').filter(word => word.length > 3)) {
    if (description.includes(word)) score += 2;
  }

  return score;
}

function projectLinks(project) {
  const links = [
    makeLink(`View ${project.name}`, project.path)
  ];

  if (project.liveUrl) {
    links.push(makeLink('Open live project', project.liveUrl));
  }

  if (project.githubUrl) {
    links.push(makeLink('View source code', project.githubUrl));
  }

  return links;
}

export async function answerPortfolioQuestion(raw, history = []) {
  const original = normalize(raw);

  if (!original) {
    return response('Please type a question, and I will do my best to help.');
  }

  // Handle ordinary conversation before searching the portfolio database.
  if (isGreeting(original)) {
    return response(
      'Hello! 👋 Welcome to WALLACE.DEV. I can tell you about Wallace’s projects, skills, education, learning journey, availability and contact details. What would you like to know?'
    );
  }

  if (isThanks(original)) {
    return response(
      'You’re welcome! 😊 Feel free to ask me anything about Wallace’s portfolio, projects or technical skills.'
    );
  }

  if (isGoodbye(original)) {
    return response(
      'Goodbye! 👋 Thanks for visiting WALLACE.DEV. Have a great day, and come back whenever you have another question.'
    );
  }

  if (containsAny(original, ['good night', 'goodnight'])) {
    return response(
      'Good night! 🌙 Thanks for visiting WALLACE.DEV. Feel free to return whenever you need more information.'
    );
  }

  if (containsAny(original, ['who are you', 'what can you do', 'can you help'])) {
    return response(
      'I’m Wallace AI, the portfolio assistant for WALLACE.DEV. I can answer questions using the portfolio’s stored information about projects, technologies, education, learning areas, availability and contact details. I can also respond to greetings and follow-up questions.'
    );
  }

  if (containsAny(original, ['how are you', 'how are things', 'how is it going', "what's up", 'whats up'])) {
    return response(
      'I’m doing well, thank you for asking! 😊 I’m ready to help you explore Wallace’s portfolio. How are you, and what would you like to know?'
    );
  }

  const q = resolveQuestion(raw, history);

  const [storedProfile, projects] = await Promise.all([
    prisma.siteProfile.findUnique({ where: { id: 1 } }),
    prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
    })
  ]);

  const profile = storedProfile || fallbackProfile;

  // Prefer a project explicitly named by the visitor.
  const rankedProjects = projects
    .map(project => ({ project, score: scoreProject(project, q) }))
    .sort((a, b) => b.score - a.score);

  const explicitProject = rankedProjects.find(item => item.score >= 24);
  if (explicitProject) {
    const project = explicitProject.project;
    return response(
      `${project.text}\n\nCurrent status: ${project.status}.`,
      projectLinks(project)
    );
  }

  if (containsAny(q, [
    'project', 'projects', 'built', 'build', 'portfolio work',
    'showcase', 'what has wallace made', 'what has wallace created'
  ])) {
    if (!projects.length) {
      return response('No verified projects are currently published in the portfolio.');
    }

    const summary = projects
      .map(project => `${project.name} (${project.status})`)
      .join('; ');

    return response(
      `Wallace’s portfolio currently lists ${projects.length} projects: ${summary}. Project details and status are taken from the portfolio database.`,
      [makeLink('Explore all projects', '/projects.html')]
    );
  }

  if (containsAny(q, [
    'technology', 'technologies', 'tech stack', 'programming',
    'programming language', 'coding language', 'tools', 'skills',
    'what can wallace use', 'technical abilities'
  ])) {
    const skills = flatten(profile.skillGroups);
    const uniqueSkills = [...new Set(skills)];

    return response(
      `The technologies and skill areas currently listed in Wallace’s portfolio are: ${uniqueSkills.join(', ')}.`,
      [makeLink('See skills', '/#skills')]
    );
  }

  if (containsAny(q, [
    'available', 'availability', 'internship', 'freelance',
    'hire', 'hiring', 'opportunity', 'opportunities',
    'attachment', 'work with wallace', 'employ wallace'
  ])) {
    return response(
      `Wallace’s portfolio lists these opportunities of interest: ${(profile.availability || []).join(', ')}. Please contact Wallace directly to confirm current availability.`,
      [makeLink('Contact Wallace', '/#contact')]
    );
  }

  if (containsAny(q, ['github', 'repository', 'repo', 'source code'])) {
    return response(
      'You can explore Wallace’s GitHub profile and portfolio repository using the links below.',
      [
        makeLink('GitHub profile', profile.githubProfile),
        makeLink('Portfolio repository', profile.githubRepo)
      ]
    );
  }

  if (containsAny(q, [
    'learning', 'currently learn', 'learning now', 'studying',
    'exploring', 'improving skills', 'learning journey'
  ])) {
    const learning = flatten(profile.learningGroups);
    const current = Array.isArray(profile.currentlyDeveloping)
      ? profile.currentlyDeveloping
      : [];

    return response(
      `Wallace’s listed learning areas include: ${[...new Set([...learning, ...current])].join(', ')}.`,
      [makeLink('Learning journey', '/#learning')]
    );
  }

  if (containsAny(q, [
    'contact', 'email', 'linkedin', 'reach', 'get in touch',
    'phone number', 'contact details'
  ])) {
    return response(
      `You can contact Wallace by email at ${profile.email}, or through LinkedIn and GitHub.`,
      [
        makeLink('Send an email', `mailto:${profile.email}`),
        makeLink('LinkedIn', profile.linkedin),
        makeLink('GitHub', profile.githubProfile)
      ]
    );
  }

  if (containsAny(q, [
    'education', 'university', 'degree', 'student',
    'who is wallace', 'about wallace', 'tell me about wallace',
    'where does wallace study'
  ])) {
    return response(
      `${profile.name} is a ${profile.role} at ${profile.university}, based in ${profile.location}. The listed study period is ${profile.studyPeriod}.\n\n${profile.aboutText}`,
      [makeLink('About Wallace', '/#about')]
    );
  }

  if (containsAny(q, ['language', 'languages spoken', 'speak'])) {
    const languages = Array.isArray(profile.languages) ? profile.languages : [];
    return response(`The languages listed in Wallace’s portfolio are: ${languages.join(', ')}.`);
  }

  if (containsAny(q, ['database', 'databases', 'sql', 'mysql'])) {
    const matches = projects
      .filter(project =>
        /database|hospital|sql|mysql|data management/i.test(
          `${project.name} ${project.text} ${JSON.stringify(project.technologies || [])}`
        )
      )
      .slice(0, 3);

    if (matches.length) {
      return response(
        `These published projects may be relevant to database work: ${matches.map(project => `${project.name} (${project.status})`).join(', ')}.`,
        matches.map(project => makeLink(project.name, project.path))
      );
    }

    return response(
      'Wallace’s skills list includes SQL, MySQL, MS Access and data modelling. I could not find a published project specifically matching that database question.'
    );
  }

  if (isSmallTalk(q)) {
    return response(
      'I’m here to help! You can ask about Wallace’s projects, programming skills, education, learning journey, availability or contact information.'
    );
  }

  return response(
    'I couldn’t find a reliable answer to that question in the portfolio information available to me. You can ask me about Wallace’s projects, technologies, education, learning areas, availability, languages or contact details.'
  );
}
