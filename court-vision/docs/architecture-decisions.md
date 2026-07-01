# Court Vision Architecture Decisions

This document records major architectural decisions made during development.

Each decision includes:
- The decision
- Why we made it
- The long-term benefit

---

# AD-001 — Separate Raw Data from Court Vision Ratings

**Decision**

Raw basketball statistics and Court Vision ratings will be stored separately.

**Reason**

Historical statistics are objective and should never change.

Court Vision ratings are interpretations that may evolve as the ranking methodology improves.

Keeping them separate allows the rating system to improve without modifying historical data.

**Impact**

- Stable historical database
- Flexible rating system
- Easier AI improvements
- Cleaner simulations

---

# AD-002 — Separate User Opinions from Official Ratings

**Decision**

User-created rankings, GOAT lists, and Starting Fives will never overwrite official Court Vision ratings.

**Reason**

Every user should be free to build their own basketball philosophy while Court Vision maintains a consistent evaluation system.

**Impact**

- Supports multiple viewpoints
- Enables social features
- Preserves analytical consistency

---

# AD-003 — Normalize Basketball Data

**Decision**

Player identity, career statistics, season statistics, and accolades will be stored in separate tables.

**Reason**

This reduces duplicated data, improves scalability, and supports importing thousands of players and seasons.

**Impact**

- Faster queries
- Easier imports
- Better long-term maintenance

---

# AD-004 — Functionality Before Polish

**Decision**

Core functionality takes priority over visual refinement.

**Reason**

A beautiful interface cannot compensate for missing features. Once the foundation is complete, visual improvements become easier and safer.

**Impact**

Development time is focused on building a reliable product before investing heavily in aesthetics.

---

# AD-005 — Reusable Components Over Duplicate Code

**Decision**

Shared UI should become reusable React components whenever practical.

Examples include:

- Header
- PlayerCard
- SearchBar
- FilterBar
- Buttons

**Reason**

Reusable components reduce bugs, improve consistency, and make future redesigns significantly easier.

**Impact**

Cleaner codebase and faster feature development.

AD-006 — Normalize Career Statistics

Career statistics are stored in a dedicated player_career_stats table linked to players by a foreign key. This separates player identity from statistical data, improves scalability, and prepares the database for richer analytics and season-level data.