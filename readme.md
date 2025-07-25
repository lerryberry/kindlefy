# Hoger

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction
API for decision making tool. Supports decisions, criteria and options to be aligned around for groups of people.

## Features
Storm around options and rank each per criteria, then have a report generated outlining the best option for any given decision, as decided by a group of people.

## Installation
1. Git clone repo
2. ...
3. profit?

## Usage
See help guide

## Server-side architecture
src/
├── providers/
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   └── RouterProvider.tsx
├── hooks/
│   ├── queries/
│   │   ├── useDecisions.ts
│   │   └── useCriteria.ts
│   └── mutations/
│       ├── useCreateDecision.ts
│       └── useUpdateDecision.ts
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   └── TopBar.tsx
│   ├── decision/
│   │   ├── DecisionList.tsx
│   │   ├── DecisionDetail.tsx
│   │   └── CreateDecisionForm.tsx
│   └── auth/
│       ├── Login.tsx
│       └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
└── types/
    └── index.ts

## Configuration
Setup a `config.env` file, then enter the following: NODE_ENV, PORT, DATABASE, AUTHREQUIRED, AUTH0LOGOUT, SECRET
BASEURL, CLIENTID, ISSUERBASEURL

## Contributing
staff only

## License
Private

## Contact
TBC