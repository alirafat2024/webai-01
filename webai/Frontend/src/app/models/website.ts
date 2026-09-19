export type SectionType = 'hero' | 'about' | 'skills' | 'projects' | 'contact';

export interface WebsiteSection {
  type: SectionType;
  data: Record<string, unknown>;
}

export interface Website {
  site: {
    title: string;
    description: string;
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  sections: WebsiteSection[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
