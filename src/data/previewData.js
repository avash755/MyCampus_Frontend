// Illustrative content for the public preview. This data never goes to the API.
export const previewStats = [
  { label: 'Events coming up', value: '08', helper: 'Find something to join', icon: 'calendar', tone: 'lavender' },
  { label: 'Study resources', value: '24', helper: 'Shared by students', icon: 'book', tone: 'peach' },
  { label: 'Opportunities', value: '12', helper: 'Explore what is out there', icon: 'briefcase', tone: 'mint' },
  { label: 'Lost & found', value: '03', helper: 'Help an item get home', icon: 'pin', tone: 'blue' }
];

export const previewEvents = [
  {
    _id: 'preview-event-design-workshop',
    title: 'Designing for a better campus',
    description: 'Share ideas and sketch small changes that could make student life better.',
    date: '2026-10-27T14:30:00',
    time: '2:30 PM',
    category: 'Workshop',
    location: 'Innovation Lab',
    attendeeCount: 34,
    capacity: 60,
    organizer: { name: 'Innovation Society' },
    coverTone: 'violet'
  },
  {
    _id: 'preview-event-fall-social',
    title: 'Fall welcome social',
    description: 'Meet classmates, enjoy music, and get to know a few campus clubs.',
    date: '2026-10-30T17:00:00',
    time: '5:00 PM',
    category: 'Social',
    location: 'Central Green',
    attendeeCount: 48,
    capacity: 100,
    organizer: { name: 'Student Activities' },
    coverTone: 'peach'
  }
];

export const previewPosts = [
  {
    _id: 'preview-resource-data-structures',
    category: 'resource',
    title: 'Midterm study guide: Data Structures',
    body: 'A student-made review sheet covering trees, graphs, and the practice problems that helped most.',
    tags: ['Computer Science', 'Study guide'],
    createdAt: '2026-10-18T10:00:00',
    author: { name: 'Mina Rahman', department: 'Computer Science' }
  },
  {
    _id: 'preview-opportunity-open-source',
    category: 'opportunity',
    title: 'Open source student fellowship',
    body: 'An eight-week guided project for students who want to build experience contributing to public software.',
    tags: ['Remote', 'Beginner friendly'],
    deadline: '2026-11-15T00:00:00',
    createdAt: '2026-10-16T12:00:00',
    author: { name: 'Campus Careers', department: 'Career Center' }
  },
  {
    _id: 'preview-lost-found-notebook',
    category: 'lost-found',
    title: 'Blue notebook found near the library',
    body: 'Found after the afternoon classes. The owner can get in touch to identify and collect it.',
    location: 'Central Library, second floor',
    createdAt: '2026-10-19T09:00:00',
    author: { name: 'Ari Hasan', department: 'Campus community' }
  }
];

export const previewNotice = {
  title: 'Library hours extended this week',
  body: 'The main library will stay open until 10 PM through Friday to support midterm study sessions.',
  author: { name: 'Student Affairs' }
};
