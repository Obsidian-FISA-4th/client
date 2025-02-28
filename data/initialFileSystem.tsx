export interface FileNode {
    id: string
    name: string
    path: string
    content: string
    type: "file"
  }

  export interface FolderNode {
    id: string
    name: string
    path: string
    type: "folder"
    children: (FileNode | FolderNode)[]
  }

  export type FileSystemNode = FileNode | FolderNode

  // Define the OpenFile interface
  export interface OpenFile {
    path: string
    content: string
    active: boolean
  }

  export const initialFileSystem: FolderNode = {
    id: "root",
    name: "Root",
    path: "",
    type: "folder",
    children: [
      {
        id: "daily-notes",
        name: "1. Daily Notes",
        path: "1. Daily Notes",
        type: "folder",
        children: [
          {
            id: "daily-note-2024-02-25",
            name: "2024-02-25.md",
            path: "1. Daily Notes/2024-02-25.md",
            type: "file",
            content: `# Daily Note: 2024-02-25

  ## Tasks for Today
  - [ ] Complete project proposal
  - [x] Review meeting notes
  - [ ] Prepare presentation slides

  ## Meeting Notes
  Today's team meeting covered the following topics:
  - Project timeline updates
  - Resource allocation for Q2
  - Client feedback on latest deliverable

  ## Ideas
  Consider implementing a new approach to the user onboarding flow. This could potentially improve conversion rates by 15-20% based on recent research.

  > The best way to predict the future is to invent it. - Alan Kay

  Link to [[React Hooks]] and [[Project Ideas]]

  \`\`\`javascript
  function calculateMetrics(data) {
    return {
      total: data.reduce((sum, item) => sum + item.value, 0),
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length
    };
  }
  \`\`\``,
          },
          {
            id: "daily-note-2024-02-24",
            name: "2024-02-24.md",
            path: "1. Daily Notes/2024-02-24.md",
            type: "file",
            content: `# Daily Note: 2024-02-24

  ## Today's Progress
  - Completed the initial wireframes for the new project
  - Had a productive meeting with the design team
  - Started researching new technologies for the upcoming sprint

  ## Notes
  Need to follow up with Sarah about the user research findings.

  ## Tomorrow's Plan
  - Start implementing the basic structure
  - Review feedback from stakeholders
  - Schedule a meeting with the backend team`,
          },
        ],
      },
      {
        id: "projects",
        name: "2. Projects",
        path: "2. Projects",
        type: "folder",
        children: [
          {
            id: "web-development",
            name: "1. Web Development",
            path: "2. Projects/1. Web Development",
            type: "folder",
            children: [
              {
                id: "react",
                name: "1. React",
                path: "2. Projects/1. Web Development/1. React",
                type: "folder",
                children: [
                  {
                    id: "react-hooks",
                    name: "React Hooks.md",
                    path: "2. Projects/1. Web Development/1. React/React Hooks.md",
                    type: "file",
                    content: `<iframe src="/markdown.html" width="100%" height="600px" frameborder="0"></iframe>`
                  },
                ],
              },
            ],
          },
          {
            id: "project-ideas",
            name: "Project Ideas.md",
            path: "2. Projects/Project Ideas.md",
            type: "file",
            content: `# Project Ideas

  ## Web Applications
  1. **Task Management System**
     - Features: Kanban board, time tracking, team collaboration
     - Tech stack: React, Node.js, MongoDB

  2. **Learning Platform**
     - Features: Course creation, progress tracking, interactive quizzes
     - Tech stack: Next.js, GraphQL, PostgreSQL

  3. **E-commerce Dashboard**
     - Features: Sales analytics, inventory management, customer insights
     - Tech stack: React, Express, MySQL

  ## Mobile Applications
  1. **Fitness Tracker**
     - Features: Workout plans, progress visualization, social sharing
     - Tech stack: React Native, Firebase

  2. **Recipe Manager**
     - Features: Recipe storage, meal planning, grocery lists
     - Tech stack: Flutter, Supabase

  ## Future Explorations
  - Blockchain applications for supply chain management
  - AR/VR educational tools
  - AI-powered content recommendation systems`,
          },
        ],
      },
    ],
  }