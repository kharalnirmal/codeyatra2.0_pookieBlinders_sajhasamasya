# Sajha Samasya

A community issue reporting and management platform that connects citizens with local authorities. Citizens can report public issues (road damage, water supply, electricity, garbage, safety) and authorities can track, respond to, and resolve them -- bridging the gap between the public and local governance in Nepal.

## Abstract

Sajha Samasya ("Shared Problem") is a web-based civic engagement platform designed to streamline the reporting and resolution of community issues across Nepali districts. Citizens submit geo-tagged issue reports with photographic evidence, which are routed to relevant local authorities based on district and category. Authorities manage these issues through a dedicated dashboard with analytics, status tracking, and response capabilities. The platform incorporates gamification (points, badges) to encourage citizen participation and includes bilingual support (English/Nepali) for accessibility.

## Tech Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- | --- |
| Framework        | Next.js 16 (App Router)               |
| Frontend         | React 19                              |
| Styling          | Tailwind CSS 4                        |
| Database         | MongoDB (Mongoose 9)                  |
| Authentication   | Clerk (role-based: citizen/authority) |
| State Management | Zustand                               |     |
| Image Storage    | Cloudinary                            |
| Maps             | Leaflet                               |
| UI Components    | shadcn/ui                             |
| Charts           | Recharts                              |

## Features

### Citizen

- Report community issues with title, description, category, photo, and map location
- Target reports to authorities and/or volunteers
- Like, comment on, and volunteer(not implemented) for issues
- District-based feed filtering
- Gamification profile (points, badges, issues raised/solved)
- Bilingual UI (English / Nepali)

### Authority

- Dashboard with analytics (status distribution, category breakdown, 7-day trends)
- Update issue status: **pending** -> **in_progress** -> **completed**
- Add official responses to citizen reports
- Configure coverage area (district & categories)
- Performance metrics and rating system

## Folder Structure

```
sajhasamasya/
├── app/
│   ├── (auth)/                     # Citizen auth routes (sign-in, sign-up)
│   ├── (user)/
│   │   └── create-post/            # Issue creation page
│   ├── authority/                   # Authority routes
│   │   ├── sign-in/                # Authority sign-in
│   │   ├── sign-up/                # Authority sign-up
│   │   ├── dashboard/              # Authority dashboard & analytics
│   │   ├── complete-setup/         # Authority profile setup
│   │   └── upgrade/                # Authority upgrade flow
│   ├── api/                        # API route handlers
│   │   ├── auth/                   # Role management & verification
│   │   ├── posts/                  # CRUD, like, comment, volunteer, status
│   │   └── user/                   # Profile & area settings
│   ├── citizen-setup/              # Citizen onboarding
│   ├── profile/                    # User profile page
│   ├── page.js                     # Home feed
│   └── layout.js                   # Root layout
├── components/
│   ├── posts/                      # PostCard, LocationPicker, edit/delete
│   ├── shared/                     # Navbar, ClientLayout, AppLoader
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── models/                     # Mongoose schemas (Post, User, Comment, Response)
│   ├── hooks/                      # useAutoRefresh, useTranslation
│   ├── store/                      # Zustand stores (language)
│   ├── db.js                       # MongoDB connection
│   ├── constants.js                # Districts & categories
│   ├── translations.js             # i18n strings (EN/NP)
│   └── utils.js                    # Utility functions
├── middleware.js                    # Clerk auth & role-based routing
├── package.json
└── next.config.mjs
```

## API Endpoints

| Endpoint                          | Method           | Description                  |
| --------------------------------- | ---------------- | ---------------------------- |
| `/api/posts`                      | GET, POST        | List / create posts          |
| `/api/posts/authority`            | GET              | Posts filtered for authority |
| `/api/posts/[id]`                 | GET, PUT, DELETE | Manage a single post         |
| `/api/posts/[id]/like`            | POST             | Like / unlike a post         |
| `/api/posts/[id]/volunteer`       | POST             | Volunteer for an issue       |
| `/api/posts/[id]/status`          | PATCH            | Update issue status          |
| `/api/posts/[id]/comments`        | GET, POST        | List / add comments          |
| `/api/auth/set-authority-role`    | POST             | Assign authority role        |
| `/api/auth/verify-authority-code` | POST             | Verify authority access code |
| `/api/user/profile`               | GET, PUT         | User profile management      |
| `/api/user/area`                  | GET, PUT         | Authority coverage area      |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Clerk account
- Cloudinary account

### Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
MONGODB_URI=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AUTHORITY_VERIFICATION_CODE=
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Districts Covered

Kathmandu, Lalitpur, Bhaktapur, Pokhara, Butwal, Dharan, Biratnagar, Birgunj, Hetauda, Bharatpur, Nepalgunj, Dhangadhi, Janakpur, Itahari, Tulsipur

## Issue Categories

Road, Water, Electricity, Garbage, Safety, Other
