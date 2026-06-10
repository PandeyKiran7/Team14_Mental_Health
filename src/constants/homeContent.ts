export const homeContent = {
  hero: {
    title: "Diabetes Management System",
    tagline: "Monitor • Manage • Improve Health",
    description:
      "Track glucose levels, book doctor appointments, receive prescriptions, and manage diabetes care—all in one secure platform built by Team 14.",
    getStartedHref: "/register",
    loginHref: "/login",
  },
  about: {
    id: "about-diabetes",
    title: "About Diabetes",
    whatIs: {
      title: "What is diabetes?",
      text: "Diabetes is a chronic condition where the body cannot properly regulate blood sugar (glucose). Over time, high glucose levels can affect the heart, kidneys, eyes, and nerves if not managed well.",
    },
    types: [
      {
        name: "Type 1",
        description:
          "The body produces little or no insulin. Usually diagnosed in children and young adults; requires daily insulin.",
      },
      {
        name: "Type 2",
        description:
          "The body does not use insulin effectively. Often linked to lifestyle factors and more common in adults.",
      },
      {
        name: "Gestational",
        description:
          "Develops during pregnancy and usually resolves after delivery, but increases future diabetes risk.",
      },
    ],
    monitoring: {
      title: "Importance of regular monitoring",
      text: "Checking blood glucose regularly helps you spot patterns, adjust treatment with your care team, and prevent serious complications.",
    },
  },
  features: {
    id: "features",
    title: "Key Features",
    items: [
      {
        title: "Medical profiles",
        description: "Patients store diabetes type, glucose targets, and emergency contacts securely.",
        icon: "activity" as const,
      },
      {
        title: "Appointments",
        description: "Book visits, get doctor approval, and join confirmed consultations online.",
        icon: "calendar" as const,
      },
      {
        title: "Prescriptions & PDFs",
        description: "Doctors issue prescriptions and recommendations; patients download PDF reports.",
        icon: "book" as const,
      },
    ],
  },
  statistics: {
    id: "statistics",
    title: "Diabetes Statistics",
    items: [
      {
        value: "537M+",
        label: "Adults living with diabetes globally (WHO estimate)",
      },
      {
        value: "1 in 2",
        label: "People with diabetes remain undiagnosed in many regions",
      },
      {
        value: "80%",
        label: "Of Type 2 cases may be preventable with healthy habits",
      },
    ],
    highlights: [
      {
        title: "Importance of early detection",
        text: "Screening and early diagnosis improve outcomes and reduce the risk of complications.",
      },
      {
        title: "Impact of healthy lifestyle habits",
        text: "Balanced diet, regular activity, and weight management support better glucose control.",
      },
    ],
  },
  benefits: {
    id: "benefits",
    title: "Benefits of Using Our System",
    items: [
      "Easy health monitoring",
      "Better disease management",
      "Improved communication with healthcare providers",
      "Secure cloud-based access",
    ],
  },
  testimonials: {
    id: "testimonials",
    title: "Testimonials",
    subtitle: "Patient success stories and user feedback",
    items: [
      {
        quote:
          "Logging my glucose daily helped me understand my patterns. My doctor and I adjusted my plan, and my readings are much more stable now.",
        name: "Sarah M.",
        role: "Type 2 patient",
      },
      {
        quote:
          "Appointment reminders mean I never miss a check-up. The platform keeps everything in one place.",
        name: "James K.",
        role: "Type 1 patient",
      },
      {
        quote:
          "The educational articles and videos gave me confidence to manage my diet and exercise.",
        name: "Priya R.",
        role: "Patient",
      },
    ],
  },
  cta: {
    title: "Register Today",
    description:
      "Join patients using our platform for smarter monitoring and better care coordination.",
    registerHref: "/register",
    learnMoreHref: "/about",
  },
};
