
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
    .replace(/[–—]/g, '-')
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

function lastAssistantAnswer(history) {
  if (!Array.isArray(history)) return '';

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];

    if (item?.role === 'assistant' && typeof item.content === 'string') {
      return item.content;
    }
  }

  return '';
}

function hasProjectContext(history) {
  if (!Array.isArray(history)) return false;

  const userMessages = history
    .filter(item => item?.role === 'user')
    .map(item => normalize(item.content));

  const assistantMessages = history
    .filter(item => item?.role === 'assistant')
    .map(item => normalize(item.content));

  const projectQuestionPattern =
    /\b(project|projects|built|build|portfolio|work|developed|development)\b/;

  const assistantProjectPattern =
    /\b(projects|in development|design complete|currently lists)\b/;

  return (
    userMessages.some(message => projectQuestionPattern.test(message)) ||
    assistantMessages.some(message => assistantProjectPattern.test(message))
  );
}

function isFollowUp(q) {
  return /^(tell me more|more details|explain more|explain it|explain that|describe it|describe that|why|how so|what about it|what about that|and that|and it|which one|which ones|which project|the first one|the second one|that one|it\b|they\b|them\b|its\b|their\b|what technologies does it use|what tech does it use|what features does it have|what does it do|how does it work|how can i do that|continue|go on|is it still in development|what about the status|what about its status)\b/.test(q);
}

function isProjectDetailFollowUp(q) {
  return /^(tell me more|more details|explain more|explain it|explain that|explain this|describe it|describe that|describe this|what features does it have|what features does that have|what does it do|how does it work|what is it about|what about it|what about that|tell me about it|tell me about that|can you explain it)\b/.test(q);
}

function isProjectStatusQuestion(q) {
  const asksWhich =
    /\b(which one|which ones|which project|what project|what projects)\b/.test(q);

  const asksStatus =
    /\b(status|in development|still developing|still in development|under development|in progress|ongoing|being developed|being built|not finished|unfinished|currently developing)\b/.test(q);

  return asksWhich && asksStatus;
}

function scoreProject(project, q) {
  const name = normalize(project.name);
  const slug = normalize(String(project.slug || '').replaceAll('-', ' '));

  const words = [
    ...new Set(
      `${name} ${slug}`.split(' ').filter(word => word.length > 2)
    )
  ];

  if (name && q.includes(name)) return 100;
  if (slug && q.includes(slug)) return 95;

  let score = 0;
  const queryWords = q.split(' ');

  for (const word of words) {
    if (queryWords.includes(word)) score += 12;
  }

  const description = normalize(project.text);

  for (const word of queryWords.filter(word => word.length > 3)) {
    if (description.includes(word)) score += 2;
  }

  return score;
}

function findProjectInText(projects, text) {
  const normalizedText = normalize(text);

  if (!normalizedText || !projects.length) return null;

  // Prefer the longest exact project name to avoid matching a shorter
  // name when project names overlap.
  const matches = projects
    .filter(project => {
      const name = normalize(project.name);
      const slug = normalize(String(project.slug || '').replaceAll('-', ' '));

      return (
        (name.length > 2 && normalizedText.includes(name)) ||
        (slug.length > 2 && normalizedText.includes(slug))
      );
    })
    .sort((a, b) => {
      const aLength = Math.max(
        normalize(a.name).length,
        normalize(String(a.slug || '').replaceAll('-', ' ')).length
      );

      const bLength = Math.max(
        normalize(b.name).length,
        normalize(String(b.slug || '').replaceAll('-', ' ')).length
      );

      return bLength - aLength;
    });

  return matches[0] || null;
}

function findProjectInRecentAssistantAnswer(projects, history) {
  const answer = lastAssistantAnswer(history);
  return findProjectInText(projects, answer);
}

function resolveQuestion(raw, history, projects = []) {
  const q = normalize(raw);
  const previous = lastUserQuestion(history);

  if (!previous) return q;

  if (isProjectStatusQuestion(q)) {
    return `${q} portfolio projects project status`;
  }

  if (!isFollowUp(q)) return q;

  // A follow-up should refer to the specific project in the most recent
  // assistant response whenever that response identifies one.
  const recentProject = findProjectInRecentAssistantAnswer(projects, history);

  if (recentProject) {
    return `${q} ${recentProject.name} ${recentProject.slug || ''}`;
  }

  if (
    /\b(project|projects|built|build|portfolio|work|development)\b/.test(previous) ||
    hasProjectContext(history)
  ) {
    return `${q} portfolio projects project status`;
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

function projectLinks(project) {
  const links = [];

  if (project.path) {
    links.push(makeLink(`View ${project.name}`, project.path));
  }

  if (project.liveUrl) {
    links.push(makeLink('Open live project', project.liveUrl));
  }

  if (project.githubUrl) {
    links.push(makeLink('View source code', project.githubUrl));
  }

  return links;
}

function isInDevelopment(project) {
  const status = normalize(project.status);

  return (
    /\b(in development|under development|in progress|currently developing|being developed|ongoing development)\b/.test(status) ||
    status === 'developing'
  );
}

function projectSummary(project) {
  return `${project.name} (${project.status || 'Status not specified'})`;
}

function answerProjectStatus(projects) {
  const activeProjects = projects.filter(isInDevelopment);

  if (activeProjects.length === 1) {
    const project = activeProjects[0];

    return response(
      `${project.name} is currently listed as ${project.status} in the portfolio database.`,
      projectLinks(project)
    );
  }

  if (activeProjects.length > 1) {
    return response(
      `The following projects are currently listed as in development: ${activeProjects.map(projectSummary).join('; ')}.`,
      [makeLink('Explore all projects', '/projects.html')]
    );
  }

  return response(
    'I could not find a project explicitly marked as in development in the current portfolio database. I will not guess its status. You can review the published projects and their statuses below.',
    [makeLink('Explore all projects', '/projects.html')]
  );
}

function answerProjectDetails(project) {
  const description = String(project.text || '').trim();
  const status = project.status || 'Status not specified';

  const text = description
    ? `${description}\n\nCurrent status: ${status}.`
    : `${project.name} is listed in Wallace’s portfolio. The portfolio database does not currently contain a detailed description for this project.\n\nCurrent status: ${status}.`;

  return response(text, projectLinks(project));
}

export async function answerPortfolioQuestion(raw, history = []) {
  const original = normalize(raw);

  if (!original) {
    return response('Please type a question, and I will do my best to help.');
  }

  // Greetings and ordinary conversation.
  if (isGreeting(original)) {
    return response(
      'Hello! 👋 Welcome to WALLACE.DEV. I can tell you about Wallace’s projects, skills, education, learning journey, availability and contact details. What would you like to know?'
    );
  }

  if (isThanks(original)) {
    return response(
      'You’re welcome! 😊 Feel free to ask me about Wallace’s portfolio, projects or technical skills.'
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
      'I’m Wallace AI, the portfolio assistant for WALLACE.DEV. I answer using stored portfolio information about projects, technologies, education, learning areas, availability and contact details. I can also respond to greetings and relevant follow-up questions.'
    );
  }

  if (containsAny(original, [
    'how are you',
    'how are things',
    'how is it going',
    "what's up",
    'whats up'
  ])) {
    return response(
      'I’m doing well, thank you for asking! 😊 I’m ready to help you explore Wallace’s portfolio. What would you like to know?'
    );
  }

  // Retrieve verified portfolio data before resolving project references.
  const [storedProfile, projects] = await Promise.all([
    prisma.siteProfile.findUnique({ where: { id: 1 } }),
    prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
    })
  ]);

  const profile = storedProfile || fallbackProfile;
  const q = resolveQuestion(raw, history, projects);

  // Explicitly named projects always take priority.
  const rankedProjects = projects
    .map(project => ({
      project,
      score: scoreProject(project, original)
    }))
    .sort((a, b) => b.score - a.score);

  const explicitProject = rankedProjects.find(item => item.score >= 24);

  if (explicitProject) {
    return answerProjectDetails(explicitProject.project);
  }

  // Follow-up questions such as "Tell me more about it" should use the
  // project mentioned in the most recent assistant answer.
  if (isProjectDetailFollowUp(original)) {
    const contextualProject = findProjectInRecentAssistantAnswer(
      projects,
      history
    );

    if (contextualProject) {
      return answerProjectDetails(contextualProject);
    }
  }

  // Status questions must be handled before generic project-list matching.
  const directStatusQuestion = isProjectStatusQuestion(original);

  const contextualStatusQuestion =
    hasProjectContext(history) &&
    /\b(which one|which ones|which project|what project|what projects)\b/.test(q) &&
    /\b(status|development|developing|progress|ongoing)\b/.test(q);

  if (directStatusQuestion || contextualStatusQuestion) {
    if (!projects.length) {
      return response(
        'No verified projects are currently published in the portfolio database.'
      );
    }

    return answerProjectStatus(projects);
  }

  // Project listing and discovery.
  if (containsAny(q, [
    'project',
    'projects',
    'built',
    'build',
    'portfolio work',
    'showcase',
    'what has wallace made',
    'what has wallace created'
  ])) {
    if (!projects.length) {
      return response(
        'No verified projects are currently published in the portfolio.'
      );
    }

    const summary = projects.map(projectSummary).join('; ');

    return response(
      `Wallace’s portfolio currently lists ${projects.length} projects: ${summary}. Project details and statuses are taken from the portfolio database.`,
      [makeLink('Explore all projects', '/projects.html')]
    );
  }

  // Technologies and skills.
  if (containsAny(q, [
    'technology',
    'technologies',
    'tech stack',
    'programming',
    'programming language',
    'coding language',
    'tools',
    'skills',
    'what can wallace use',
    'technical abilities'
  ])) {
    const skills = [...new Set(flatten(profile.skillGroups))];

    return response(
      `The technologies and skill areas currently listed in Wallace’s portfolio are: ${skills.join(', ')}.`,
      [makeLink('See skills', '/#skills')]
    );
  }

  // Availability and opportunities.
  if (containsAny(q, [
    'available',
    'availability',
    'internship',
    'freelance',
    'hire',
    'hiring',
    'opportunity',
    'opportunities',
    'attachment',
    'work with wallace',
    'employ wallace'
  ])) {
    return response(
      `Wallace’s portfolio lists these opportunities of interest: ${(profile.availability || []).join(', ')}. Please contact Wallace directly to confirm current availability.`,
      [makeLink('Contact Wallace', '/#contact')]
    );
  }

  // GitHub and source code.
  if (containsAny(q, ['github', 'repository', 'repo', 'source code'])) {
    return response(
      'You can explore Wallace’s GitHub profile and portfolio repository using the links below.',
      [
        makeLink('GitHub profile', profile.githubProfile),
        makeLink('Portfolio repository', profile.githubRepo)
      ]
    );
  }

  // Learning areas.
  if (containsAny(q, [
    'learning',
    'currently learn',
    'learning now',
    'studying',
    'exploring',
    'improving skills',
    'learning journey'
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

  // Contact details.
  if (containsAny(q, [
    'contact',
    'email',
    'linkedin',
    'reach',
    'get in touch',
    'phone number',
    'contact details'
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

  // Education and biography.
  if (containsAny(q, [
    'education',
    'university',
    'degree',
    'student',
    'who is wallace',
    'about wallace',
    'tell me about wallace',
    'where does wallace study'
  ])) {
    return response(
      `${profile.name} is a ${profile.role} at ${profile.university}, based in ${profile.location}. The listed study period is ${profile.studyPeriod}.\n\n${profile.aboutText}`,
      [makeLink('About Wallace', '/#about')]
    );
  }

  // Languages.
  if (containsAny(q, ['language', 'languages spoken', 'speak'])) {
    const languages = Array.isArray(profile.languages)
      ? profile.languages
      : [];

    return response(
      `The languages listed in Wallace’s portfolio are: ${languages.join(', ')}.`
    );
  }

  // Database-related questions.
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
        `These published projects may be relevant to database work: ${matches.map(projectSummary).join(', ')}.`,
        matches.flatMap(project =>
          project.path ? [makeLink(project.name, project.path)] : []
        )
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
