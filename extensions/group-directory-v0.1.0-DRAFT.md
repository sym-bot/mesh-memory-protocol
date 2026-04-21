# MMP Extension: Group Directory (Draft)

**Persistent Group Metadata, Admin Approval, and Directory Enumeration for Cognitive Mesh Coupling**

| | |
|---|---|
| Version | 0.1.0-DRAFT |
| Status | Draft — not yet published, not yet implemented |
| Date | 19 April 2026 |
| Author | Hongwei Xu <hongwei@sym.bot>, SYM.BOT Ltd |
| Extends | [MMP v0.2.3](https://sym.bot/spec/mmp) — Section 5.8 (Mesh Groups) |
| Depends on | [sym-relay](https://github.com/sym-bot/sym-relay) — token-channel isolation (already shipped) |
| Canonical URL | https://sym.bot/spec/mmp-group-directory (not yet live) |
| Licence | CC BY 4.0 (specification text) |
| Motivation context | [sym-mesh-channel conversation, 19 Apr 2026](https://github.com/sym-bot/sym-mesh-channel/pull/0) |

---

## Abstract

MMP §5.8 mesh groups give cognitive meshes an isolation primitive: nodes in
different groups do not discover each other at mDNS or relay level. This is
sufficient for small dev teams who already know each other's group names
and coordinate the shared secret out of band.

It is **not** sufficient for the UX model end users expect from chat
platforms (Telegram, Discord, Slack): browse a list of groups, see who is
in them, request to join, wait for admin approval, get accepted or denied.

This extension specifies the protocol additions needed to bridge that gap:
**persistent group metadata** (groups visible even when every member is
offline), **admin approval** (pending-member queue, admin identity, accept
/ reject actions), and **directory enumeration** (browse public groups
through a known directory endpoint). The extension is opt-in per group —
MMP §5.8 bare groups continue to work unchanged for any team that wants
the minimal primitive.

---

## Introduction

### What MMP §5.8 already provides

- **LAN groups**: a node setting `SYM_GROUP=<name>` advertises on
  `_<name>._tcp` via Bonjour/mDNS. Nodes in different groups never see
  each other at mDNS. Membership is per-process, constructor-locked.
- **Relay channels**: the `sym-relay` server maps tokens to channels
  (`SYM_RELAY_CHANNELS=token1:channel1,...`). Each token reaches exactly
  one channel; channels are isolated routes on the relay. Peers on the
  same token see each other's presence (gossiped connected + offline
  peers with wake channels) and exchange CMBs. Peers on different
  tokens never see each other.

The primitives above give isolation and per-token peer visibility *within*
a group. They do not give any cross-group visibility, public browsing,
admin authority, or persistent state that survives all members going
offline.

### What this extension adds

1. **Persistent group metadata** — a group has a canonical name,
   optional description, creation timestamp, admin node-id(s),
   visibility flag (public / private), and a creation-protected
   relay-channel binding. This metadata outlives member presence.

2. **Admin approval gate** — joining a private group is a two-step
   request / accept flow. The requester's node-id enters a pending
   queue visible to admin(s). Admin issues accept (grants channel
   token) or reject (notifies requester). Public groups skip the
   approval gate but still record membership.

3. **Directory enumeration** — a well-known endpoint on the relay
   (`/groups`) returns the list of public groups with metadata.
   Private groups are absent from this listing (visible only to
   members and pending requesters).

4. **Group lifecycle operations** — create (become first admin),
   transfer admin, revoke member, delete group (admin only).

All four are opt-in: a bare MMP §5.8 group as shipped in sym-mesh-channel
0.1.23 continues to work exactly as it does today. A group becomes
*directory-registered* only when an admin explicitly creates it on a
relay that supports this extension.

---

## Design

### Data model

A directory-registered group is represented on the relay as:

```
Group {
  id:                  string              # UUID v7, issued by relay on creation
  name:                string              # kebab-case, unique within the relay host
  description:         string?             # optional, ≤ 280 chars
  visibility:          "public" | "private"
  created_at:          ISO 8601 timestamp
  admins:              [node_id]           # one or more; first = creator
  members:             [node_id]           # accepted members
  pending_requests:    [PendingRequest]    # present only for admins' view
  channel_token:       string              # shared secret granted to accepted members
  service_type:        string              # _<kebab-name>._tcp for LAN bridge (optional)
}

PendingRequest {
  node_id:             string              # requester's full node-id
  name:                string              # requester's display name (self-reported)
  public_key:          string              # Ed25519 hex, for attestation of accept action
  requested_at:        ISO 8601 timestamp
  message:             string?             # optional prose from requester
}
```

Persistence: relay writes `Group` records to disk (SQLite is sufficient —
low write volume, single-digit-MB scale even at thousands of groups).
Group records survive relay restart; member presence does not (presence
is ephemeral, already gossiped through existing `relay-peers` frames).

### Protocol frames (new)

All frames travel on the existing relay WebSocket. Frames are
JSON-encoded and follow the `type` discriminator convention from MMP §5.

**From client to relay:**

```jsonc
{ "type": "group-create", "name": "backend-team", "description": "...",
  "visibility": "private" }

{ "type": "group-list", "visibility": "public" }   // public only — admin auth
                                                   // required for "private" list

{ "type": "group-join-request", "group_id": "…", "message": "..." }

{ "type": "group-accept", "group_id": "…", "node_id": "…" }   // admin only

{ "type": "group-reject", "group_id": "…", "node_id": "…", "reason": "..." }

{ "type": "group-leave", "group_id": "…" }

{ "type": "group-revoke", "group_id": "…", "node_id": "…" }   // admin only

{ "type": "group-transfer-admin", "group_id": "…", "new_admin": "…" }

{ "type": "group-delete", "group_id": "…" }   // admin only
```

**From relay to client:**

```jsonc
{ "type": "group-created", "group": { ... } }         // response to create

{ "type": "group-list-result", "groups": [ ... ] }    // response to list

{ "type": "group-join-pending", "group_id": "…" }     // requester waits

{ "type": "group-join-accepted", "group_id": "…", "channel_token": "…" }

{ "type": "group-join-rejected", "group_id": "…", "reason": "…" }

{ "type": "group-member-joined", "group_id": "…", "node_id": "…" }   // fanout

{ "type": "group-member-left", "group_id": "…", "node_id": "…" }

{ "type": "group-pending-update", "group_id": "…",
  "pending": [ PendingRequest, ... ] }                              // admin only

{ "type": "group-admin-transferred", "group_id": "…",
  "old_admin": "…", "new_admin": "…" }

{ "type": "group-deleted", "group_id": "…" }
```

### Authorisation

- **Create**: any authenticated node can create. Creator is sole initial admin.
- **List public**: any authenticated node. Anonymous listing is out of scope
  for v0.1.0 (requires a separate unauthenticated endpoint with rate limiting).
- **List private**: admin of the target group only, or member for their
  own memberships.
- **Accept / reject / revoke / delete / transfer-admin**: admin only, verified
  by the `node_id` in the WebSocket's authenticated session matching the
  group's `admins` list.
- **Join request**: any authenticated node. Request queues for admin review.
- **Leave**: any current member.

### Directory discovery

The relay exposes an HTTP GET endpoint `/groups` returning the list of
public groups as JSON:

```json
{
  "relay": "sym-relay.onrender.com",
  "groups": [
    {
      "id": "0193...",
      "name": "sym-research",
      "description": "Open discussion of mesh cognition research",
      "created_at": "2026-04-20T12:34:56Z",
      "member_count": 7,
      "online_now": 3
    }
  ]
}
```

This endpoint has no auth by design (public discovery). Rate-limited to
10 requests per minute per source IP. Private groups are never included.

An MCP client implementing this extension adds `sym_groups_browse` tool
that hits this endpoint on the configured relay host and returns the
list in human-readable form.

### Relationship to existing primitives

| Primitive | Status | Relationship to this extension |
|---|---|---|
| MMP §5.8 bare LAN group | Shipped (v0.1.23) | Unchanged. Bare groups remain in-band (mDNS only), not registered with any relay, invisible to `/groups`. |
| sym-relay token/channel isolation | Shipped | This extension uses token/channel as the transport primitive for directory-registered private groups. Creation emits a token; accept hands the token to the accepted member. |
| `sym_invite_create` / `sym_invite_info` | Shipped (v0.1.23) | URL-based invite flow remains as the **private** join path — admin generates invite, shares out of band, each invite bundles the channel token. Works with or without directory registration. |
| `sym_join_group` | Shipped (v0.1.23) | Extended: for directory-registered groups, `sym_join_group` becomes multi-step — issues `group-join-request`, waits for accept, then hot-swaps with the granted token. |

### Implementation surface

Estimated size (rough):

- **sym-relay**: ~800 LOC additional (SQLite schema, group CRUD handlers,
  admin auth, fanout on group-member events, `/groups` HTTP endpoint,
  rate limiting). Existing peer gossip infra reused.
- **@sym-bot/sym**: ~300 LOC additional (protocol frames on SymNode,
  admin-side events, pending-queue subscription, request/accept state
  machine).
- **sym-mesh-channel**: 4–6 new MCP tools (~200 LOC):
  - `sym_groups_browse` — GET /groups on configured relay
  - `sym_group_create` — creates on relay, becomes admin
  - `sym_group_request_join` — sends join-request, waits for result
  - `sym_group_approve_member` — admin action on pending request
  - `sym_group_reject_member` — admin action on pending request
  - `sym_group_revoke_member` — admin action post-accept
  - (extensions to existing `sym_groups_discover` to include
    directory-registered groups on configured relays)

---

## Open questions

1. **Multi-admin conflict**: what happens if two admins simultaneously
   accept/reject the same pending member? Last-writer-wins is simplest;
   need to verify it doesn't cause token leaks to rejected members.

2. **Relay federation**: the spec above assumes a single relay host
   per group. Federated relays (groups discoverable across multiple
   relay hosts) is possible but substantially increases complexity.
   Recommend single-relay v0.1.0, federation in v0.2+.

3. **Public-group enumeration abuse**: `/groups` is unauthenticated for
   public discovery. A popular relay could become a discovery target
   for spam or scraping. Rate limits help; stronger mitigations
   (proof-of-work tokens, captcha) may be needed if this matters at
   scale. Private relays don't have this problem.

4. **Group name collisions across relays**: names are unique per relay
   host. Cross-relay, two unrelated groups can share a name. This is
   acceptable in v0.1.0 — invite URLs already carry the relay host as
   the authority.

5. **Token rotation**: if a member is revoked, the channel token is
   shared with remaining members unchanged; the revoked ex-member
   technically retains the token until the relay forces reconnection
   and rejects the now-revoked node-id. Safer: rotate the channel
   token on every revoke. Trade-off: momentary re-handshake for all
   remaining members. Recommend rotate-on-revoke.

6. **Bootstrap admin on existing bare group**: how does a team
   currently using a bare MMP §5.8 group "upgrade" to a directory-
   registered group without losing presence? Likely answer: create
   the new directory-registered group, migrate members one at a time
   via invite URLs, decommission the bare group. Document in a
   migration guide, not in the protocol.

7. **Mobile / sleeping peers**: MMP §16 (SYMBit) and related extensions
   contemplate sleeping peers. Pending-member queue for a sleeping
   admin is a known gap — admin's client must be online to process
   requests. Future: relay-side "admin delegate" role for long-sleep
   scenarios. Out of scope for v0.1.0.

---

## Rollout plan

Three stages, each independently valuable:

### Stage 1 — relay directory endpoint + public-group CRUD (v0.1.0-alpha)

- `sym-relay`: schema, `/groups` HTTP, group-create / group-list / group-delete.
- `@sym-bot/sym`: `SymNode.listGroups()` / `SymNode.createGroup()`.
- `sym-mesh-channel`: `sym_groups_browse`, `sym_group_create`.
- **UX delivered**: users can browse public groups on a relay, create
  new public groups, and share direct invite URLs. No admin approval yet —
  public groups are open-join.

### Stage 2 — admin approval gate (v0.1.0-beta)

- `sym-relay`: pending-request queue, admin-only frames (accept, reject,
  revoke), fanout on member changes.
- `@sym-bot/sym`: admin-side events, request state machine.
- `sym-mesh-channel`: `sym_group_request_join`, `sym_group_approve_member`,
  `sym_group_reject_member`, `sym_group_revoke_member`.
- **UX delivered**: private groups with gated membership. Full Telegram-
  style team management within a single relay.

### Stage 3 — polish, migration, security hardening (v0.1.0)

- Token rotation on revoke.
- Multi-admin race resolution.
- Migration guide for upgrading bare §5.8 groups.
- Rate-limiting on `/groups`.
- Move spec from DRAFT to Published. Publish canonical URL
  `https://sym.bot/spec/mmp-group-directory`.

---

## Notes for future-me

**Motivation context** (19 April 2026): we shipped sym-mesh-channel 0.1.23
with hot-swap group join + invite-URL flow. User feedback was that the
ideal UX is Telegram-like (browse, request, admin approves) but that
requires server-side persistent state — the existing P2P + token-channel
relay handles isolation but not directory or admin. This extension is the
design for that missing layer.

**Why this is a protocol extension and not just a relay feature**: the
group-member lifecycle frames (`group-join-request`, `group-member-joined`,
etc.) need to interoperate between different client implementations —
sym-mesh-channel (Node.js), sym-swift (iOS/macOS), any future client. The
relay is the reference implementation, but the protocol frames belong to
MMP. Hence the extension-document home rather than a relay-repo design doc.

**What not to build**: resist adding rich chat features (text formatting,
reactions, read receipts) — these are out of scope and would blur the line
between MMP (cognitive state exchange) and chat platforms (human
messaging). Group-directory stays narrowly about membership, not content.

**Pick-up signal for later**: when either (a) a user explicitly asks for
admin-approval UX, or (b) we have more than ~50 dev teams using bare §5.8
groups and confusion about "where's my group?" becomes a support issue,
that's the signal to pick this up.
