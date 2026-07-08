# Flamingo aur Maina (FAM) - Hospitality Website

## Overview
FAM is a boutique café and stays website for a property in Jibhi, Himachal Pradesh, with user authentication, room browsing, booking management, and a user profile dashboard. Built as a modern multi-page web application deployed on Vercel with a serverless Python backend and Supabase for data persistence.

## Pages
- **Home** (`/index.html`) — Hero section with "Welcome Home" heading, search form, featured rooms, café & experiences
- **Rooms** (`/pages/rooms/index.html`) — Room listing with filters (room type, amenities)
- **Room Details** (`/pages/room-details/index.html`) — Individual room view with gallery, amenities, booking form
- **Booking** (`/pages/booking/index.html`) — Checkout flow with personal details, price summary (Including GST)
- **Payment** (`/pages/payment/index.html`) — Razorpay payment simulation with order summary
- **About** (`/pages/about/index.html`) — FAM story, vision, stats (6 cozy rooms, 360° mountain views)
- **Contact** (`/pages/contact/index.html`) — Contact form, info cards (Visit Us, Call Us, Email Us, Get Directions), Google Maps link
- **Login / Register / Forgot Password / Reset Password** — Auth flow pages
- **Dashboard** (`/pages/dashboard/index.html`) — User overview with upcoming stay, recent stays, booking stats
- **Profile** (`/pages/profile/index.html`) — Full user profile with avatar, edit info, change password, booking history, payment history
- **Admin** (`/pages/admin/index.html`) — Admin dashboard with overview stats and recent bookings

## Rooms
| Room | Type | Capacity | Price (per night) |
|---|---|---|---|
| Flamingo 1 | Duplex | 4 Persons | ₹6,000 |
| Flamingo 2 | King Attic | 4 Persons | ₹5,000 |
| Flamingo 3 | Duplex | 4 Persons | ₹6,000 |
| Maina 1 | Private Room | 2 Persons | ₹2,500 |
| Maina 2 | Private Room | 2 Persons | ₹2,000 |
| Maina 3 | Private Room | 2 Persons | ₹2,500 |

All prices include GST.

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Page structure |
| **Tailwind CSS** (via CDN) | Utility-first styling |
| **Google Fonts** (Playfair Display + Inter) | Typography |
| **Material Symbols** | Icons |
| **Vanilla JavaScript** (ES6+) | Client-side logic (particles, theme, animations) |
| **CSS Custom Properties** | Theming (Green/Winter modes with particle animations) |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3** | Serverless API handler |
| **FastAPI** | Local development server |
| **Vercel Python Runtime** | Serverless deployment (WSGI via `api/[...slug].py`) |
| **Supabase REST API** | Database persistence |
| **JWT** (HMAC-SHA256) | Authentication tokens |
| **bcrypt-style hashing** (SHA-256 + salt) | Password storage |

### Database (Supabase / PostgreSQL)
| Table | Purpose |
|---|---|
| `users` | User accounts |
| `rooms` | Room inventory (6 rooms) |
| `bookings` | Reservation records |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Hosting & serverless deployment |
| **Supabase** | Managed PostgreSQL database |
| **Git** | Version control |

## API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/register` | Create new user account |
| POST | `/api/login` | Authenticate and return JWT |
| GET | `/api/profile` | Fetch user profile |
| PUT | `/api/profile/update` | Update profile fields |
| POST | `/api/profile/upload-image` | Upload avatar (base64) |
| PUT | `/api/change-password` | Change user password |
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/<id>` | Single room details |
| POST | `/api/book` | Create a booking |
| GET | `/api/bookings` | List user's bookings |
| GET | `/api/bookings/<id>` | Single booking details |
| DELETE | `/api/bookings/<id>` | Cancel a booking |
| POST | `/api/contact` | Submit contact form |
