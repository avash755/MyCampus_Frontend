const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

export const demoStudent = {
  id: 'demo-student',
  name: 'Alex Morgan',
  email: 'student@mycampus.local',
  role: 'student',
  department: 'Computer Science',
  studentId: 'MC-2048',
  avatarColor: '#6d65e8'
};

export const demoAdmin = {
  id: 'demo-admin',
  name: 'Campus Admin',
  email: 'admin@mycampus.local',
  role: 'admin',
  department: 'Student Affairs',
  studentId: 'STAFF-01',
  avatarColor: '#e58a65'
};

export const initialEvents = [
  {
    _id: 'event-1',
    title: 'Designing for a better campus',
    category: 'Workshop',
    description: 'A hands-on afternoon exploring user research, quick prototypes, and small ideas that make everyday student life better.',
    date: inDays(2),
    time: '2:30 PM',
    location: 'Innovation Lab · Building A',
    organizer: { name: 'Design Society' },
    attendees: ['demo-student', 'a1', 'a2', 'a3'],
    coverTone: 'violet'
  },
  {
    _id: 'event-2',
    title: 'Fall welcome social',
    category: 'Social',
    description: 'Meet new people, find a club to join, and enjoy an easygoing evening with music and snacks on the lawn.',
    date: inDays(5),
    time: '5:00 PM',
    location: 'Central Green',
    organizer: { name: 'Student Union' },
    attendees: ['a1', 'a2'],
    coverTone: 'peach'
  },
  {
    _id: 'event-3',
    title: 'Portfolio review hour',
    category: 'Career',
    description: 'Bring a project or portfolio draft and get friendly feedback from senior students and volunteer mentors.',
    date: inDays(8),
    time: '11:00 AM',
    location: 'Library · Room 204',
    organizer: { name: 'Career Circle' },
    attendees: ['a1', 'a2', 'a3', 'a4', 'a5'],
    coverTone: 'mint'
  },
  {
    _id: 'event-4',
    title: 'Open mic on the quad',
    category: 'Community',
    description: 'A relaxed night for music, poetry, comedy, and cheering on your classmates. Everyone is welcome.',
    date: inDays(11),
    time: '6:30 PM',
    location: 'The Quad',
    organizer: { name: 'Campus Arts Club' },
    attendees: ['a1', 'a2', 'a3'],
    coverTone: 'blue'
  }
];

export const initialPosts = [
  {
    _id: 'post-1',
    title: 'Introduction to Human Computer Interaction',
    body: 'A clear set of lecture notes covering usability principles, user research methods, and the basics of prototyping.',
    category: 'resource',
    author: { name: 'Maya Chen', department: 'Computer Science' },
    department: 'Computer Science',
    tags: ['Lecture notes', 'Year 2'],
    link: 'https://example.com/hci-notes',
    featured: true,
    createdAt: inDays(-2)
  },
  {
    _id: 'post-2',
    title: 'Statistics midterm study guide',
    body: 'A shared review sheet with practice questions, formula reminders, and a few helpful worked examples.',
    category: 'resource',
    author: { name: 'Jordan Lee', department: 'Mathematics' },
    department: 'Mathematics',
    tags: ['Study guide', 'Year 1'],
    link: 'https://example.com/statistics-guide',
    createdAt: inDays(-1)
  },
  {
    _id: 'post-3',
    title: 'Blue water bottle found near the library',
    body: 'Found this bottle on the second-floor study table around 3 PM. It is safe with the library front desk.',
    category: 'lost-found',
    author: { name: 'Alex Morgan', department: 'Computer Science' },
    location: 'Library · Front desk',
    contact: 'student@mycampus.local',
    createdAt: inDays(-1)
  },
  {
    _id: 'post-4',
    title: 'Summer product design internship',
    body: 'A sample opportunity listing for the prototype. Please confirm details and apply directly through the organization.',
    category: 'opportunity',
    author: { name: 'Campus Admin', department: 'Student Affairs' },
    department: 'All departments',
    tags: ['Internship', 'Design'],
    link: 'https://example.com/careers',
    deadline: inDays(20),
    featured: true,
    createdAt: inDays(-3)
  },
  {
    _id: 'post-5',
    title: 'Student services desk hours',
    body: 'The student services desk is open weekdays from 9 AM to 4 PM this week.',
    category: 'notice',
    author: { name: 'Campus Admin', department: 'Student Affairs' },
    department: 'Student Affairs',
    createdAt: inDays(-1)
  }
];