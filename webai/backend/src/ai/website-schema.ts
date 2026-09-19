const projectItemSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    technologies: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'description', 'technologies'],
  additionalProperties: false,
} as const;

const heroDataSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    role: { type: 'string' },
    description: { type: 'string' },
    buttonText: { type: 'string' },
  },
  required: ['name', 'role', 'description', 'buttonText'],
  additionalProperties: false,
} as const;

const aboutDataSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['title', 'description'],
  additionalProperties: false,
} as const;

const skillsDataSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'string' } },
  },
  required: ['items'],
  additionalProperties: false,
} as const;

const projectsDataSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    projects: { type: 'array', items: projectItemSchema },
  },
  required: ['title', 'projects'],
  additionalProperties: false,
} as const;

const contactDataSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    email: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['title', 'email', 'description'],
  additionalProperties: false,
} as const;

const sectionSchema = <T extends object>(data: T) => ({
  type: 'object',
  properties: { data },
  required: ['data'],
  additionalProperties: false,
});

export const websiteSchema = {
  type: 'object',

  properties: {
    site: {
      type: 'object',

      properties: {
        title: {
          type: 'string',
        },

        description: {
          type: 'string',
        },
      },

      required: ['title', 'description'],

      additionalProperties: false,
    },

    theme: {
      type: 'object',

      properties: {
        mode: {
          type: 'string',
          enum: ['light', 'dark'],
        },

        primaryColor: {
          type: 'string',
        },

        backgroundColor: {
          type: 'string',
        },

        textColor: {
          type: 'string',
        },
      },

      required: ['mode', 'primaryColor', 'backgroundColor', 'textColor'],

      additionalProperties: false,
    },

    sections: {
      type: 'object',
      properties: {
        hero: { anyOf: [sectionSchema(heroDataSchema), { type: 'null' }] },
        about: { anyOf: [sectionSchema(aboutDataSchema), { type: 'null' }] },
        skills: { anyOf: [sectionSchema(skillsDataSchema), { type: 'null' }] },
        projects: { anyOf: [sectionSchema(projectsDataSchema), { type: 'null' }] },
        contact: { anyOf: [sectionSchema(contactDataSchema), { type: 'null' }] },
      },
      required: ['hero', 'about', 'skills', 'projects', 'contact'],
      additionalProperties: false,
    },
  },

  required: ['site', 'theme', 'sections'],

  additionalProperties: false,
} as const;
