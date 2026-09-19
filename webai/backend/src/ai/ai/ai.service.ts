import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { websiteSchema } from '../website-schema.js';

@Injectable()
export class AiService {
  private openai?: OpenAI;

  private getOpenAI(): OpenAI {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is required to generate a website');
    }

    return (this.openai ??= new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    }));
  }

  async generate(prompt: string) {
    try {
      const response = await this.getOpenAI().chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: `
               You are an AI website builder.
                Your job is to create website content based on the user's request.
                Return ONLY structured website data.
                Do NOT generate:
                - HTML
                - CSS
                - JavaScript
                - Angular code
                - React code
                Always return this exact top-level structure. The keys site, theme, and sections are mandatory.
                Inside sections, always output all five keys exactly once: hero, about, skills, projects, and contact.
                Never omit any key. If contact is not requested, output its value as null.
                {
                  "site": { "title": "...", "description": "..." },
                  "theme": { "mode": "dark", "primaryColor": "#8b5cf6", "backgroundColor": "#08090d", "textColor": "#ffffff" },
                  "sections": {
                    "hero": { "data": { "name": "...", "role": "...", "description": "...", "buttonText": "..." } },
                    "about": { "data": { "title": "...", "description": "..." } },
                    "skills": { "data": { "items": ["..."] } },
                    "projects": { "data": { "title": "...", "projects": [{ "title": "...", "description": "...", "technologies": ["..."] }] } },
                    "contact": { "data": { "title": "...", "email": "...", "description": "..." } }
                  }
                }
                The example above shows the expected complete section structure. Copy all five keys before adding content.
                Never return sections as the root object. Never return sections as an array.
                Use null for a section that is not requested.
                The website can contain these section types: hero, about, skills, projects, contact.
                Create realistic content based on the user's request.
                For a portfolio website:
                hero should contain:
                - name
                - role
                - description
                - buttonText
                about should contain:
                - title
                - description
                skills should contain:
                - items
                projects should contain:
                - projects
                - each project has title, description and technologies
                contact should contain:
                - title
                - email
                Always return data matching the provided schema.
            `,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'website',
            strict: true,
            schema: websiteSchema,
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('Gemini returned an empty response');
      }

      const website = JSON.parse(content);
      const sectionTypes = [
        'hero',
        'about',
        'skills',
        'projects',
        'contact',
      ] as const;

      return {
        ...website,
        sections: sectionTypes.flatMap((type) => {
          const section = website.sections[type];
          return section ? [{ type, data: section.data }] : [];
        }),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('User location is not supported')) {
        throw new HttpException(
          'Gemini API is not available in the current user location.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw error;
    }
  }
  //////modify website ////////////////////////////////////
  async generateCodeChanges(
    prompt: string,
    files: {
      path: string;
      content: string;
    }[],
  ) {
    const response = await this.getOpenAI().chat.completions.create({
      model: 'openai/gpt-oss-20b',

      messages: [
        {
          role: 'system',
          content: `
You are an AI coding agent.

You modify an existing web project based on the user's request.

You will receive:
1. The user's requested change.
2. A list of project files and their current contents.

Your job is to determine which files need to change.

Rules:
- Only modify files that are necessary.
- Preserve existing functionality unless the user explicitly asks to change it.
- Return the COMPLETE new content of every modified file.
- Do not return partial snippets.
- Do not use markdown code fences.
- Do not explain the code.
- Do not modify node_modules.
- Do not modify .env files.
- Do not invent files unless they are actually necessary.
- If no changes are necessary, return an empty changes array.

For each change return:
- file: the relative project file path
- action: "modify", "create", or "delete"
- content: complete file content for modify/create
- content must be null for delete

Return only the structured response.
        `,
        },
        {
          role: 'user',
          content: JSON.stringify({
            request: prompt,
            files,
          }),
        },
      ],

      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'code_changes',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              changes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                    },
                    action: {
                      type: 'string',
                      enum: ['modify', 'create', 'delete'],
                    },
                    content: {
                      type: ['string', 'null'],
                    },
                  },
                  required: ['file', 'action', 'content'],
                  additionalProperties: false,
                },
              },
            },
            required: ['changes'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('Groq returned an empty coding response');
    }

    return JSON.parse(content);
  }

  /////////////////////get filtered file///////////////
  async selectFilesForTask(
    prompt: string,
    availableFiles: string[],
  ): Promise<string[]> {
    const response = await this.getOpenAI().chat.completions.create({
      model: 'openai/gpt-oss-20b',

      max_tokens: 1000,

      messages: [
        {
          role: 'system',
          content: `
You are an AI coding agent.

You are given a user's requested change and a list of files
available in a web project.

Determine which files are relevant to completing the request.

Rules:
- Only select files that actually exist in the provided list.
- Select the smallest reasonable set of files.
- Do not select node_modules.
- Do not select .env files.
- Do not select dist or build files.
- Return only file paths.
- If the request concerns the visual appearance of a component,
  select the relevant HTML/template and CSS files.
- If the request concerns application logic, select the relevant
  TypeScript files.
          `,
        },
        {
          role: 'user',
          content: JSON.stringify({
            request: prompt,
            availableFiles,
          }),
        },
      ],

      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'file_selection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
            required: ['files'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('Groq returned an empty file selection response');
    }

    const result = JSON.parse(content);

    return result.files;
  }
}
