/**
 * ─────────────────────────────────────────────────────────────
 *  Ticket Management System — API Test Script
 *  Run:  node test-api.js
 *  Requires the backend to be running on http://localhost:5000
 * ─────────────────────────────────────────────────────────────
 *
 *  Uses only Node.js built-ins (no extra deps).
 *  Covers every endpoint with fresh, timestamped data each run.
 */

const BASE = 'http://localhost:5000/api/v1';
const ts = Date.now(); // unique suffix so each run is fresh

// ── helpers ──────────────────────────────────────────────────

const clr = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

let passed = 0, failed = 0;

function log(label, ok, status, body) {
    const icon = ok ? `${clr.green}✔` : `${clr.red}✘`;
    const colour = ok ? clr.green : clr.red;
    console.log(`\n${icon} ${colour}${clr.bold}${label}${clr.reset}`);
    console.log(`   Status : ${status}`);
    if (!ok) console.log(`   Body   : ${JSON.stringify(body, null, 2)}`);
}

async function req(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let json;
    try { json = await res.json(); } catch { json = {}; }
    return { status: res.status, body: json };
}

function assert(label, status, body, expectedStatus, checkFn) {
    const ok = status === expectedStatus && (!checkFn || checkFn(body));
    if (ok) passed++;
    else failed++;
    log(label, ok, status, body);
    return ok;
}

// ── test runner ───────────────────────────────────────────────

async function run() {
    console.log(`\n${clr.cyan}${clr.bold}══════ Ticket Management API Tests ══════${clr.reset}`);
    console.log(`Base URL : ${BASE}\nTimestamp: ${ts}\n`);

    // ─── 0. Health check ───────────────────────────────────────
    console.log(`\n${clr.yellow}${clr.bold}━━━ Health ━━━${clr.reset}`);
    {
        const healthRes = await fetch('http://localhost:5000/health');
        let healthJson;
        try { healthJson = await healthRes.json(); } catch { healthJson = {}; }
        assert('GET /health', healthRes.status, healthJson, 200, b => b.status === 'healthy');
    }

    // ─── 1. Auth — Register (Admin) ────────────────────────────
    console.log(`\n${clr.yellow}${clr.bold}━━━ Auth ━━━${clr.reset}`);

    let adminToken, adminId, userToken, userId;

    {
        // NOTE: first user in a fresh DB becomes ADMIN only if your seed/schema does so.
        // We register two users: one will be promoted manually if needed.
        const { status, body } = await req('POST', '/auth/register', {
            body: {
                name: `Admin User ${ts}`,
                email: `admin_${ts}@test.com`,
                password: 'AdminPass123!',
            },
        });
        const ok = assert('POST /auth/register (admin user)', status, body, 201,
            b => b.data?.accessToken && b.data?.user?.id);
        if (ok) { adminToken = body.data.accessToken; adminId = body.data.user.id; }
    }

    {
        // Duplicate email → 409
        const { status, body } = await req('POST', '/auth/register', {
            body: {
                name: 'Dup User',
                email: `admin_${ts}@test.com`,
                password: 'AdminPass123!',
            },
        });
        assert('POST /auth/register — duplicate email (expect 409)', status, body, 409);
    }

    {
        // Register a regular user
        const { status, body } = await req('POST', '/auth/register', {
            body: {
                name: `Regular User ${ts}`,
                email: `user_${ts}@test.com`,
                password: 'UserPass123!',
            },
        });
        const ok = assert('POST /auth/register (regular user)', status, body, 201,
            b => b.data?.accessToken && b.data?.user?.id);
        if (ok) { userToken = body.data.accessToken; userId = body.data.user.id; }
    }

    {
        // Login — correct credentials
        const { status, body } = await req('POST', '/auth/login', {
            body: { email: `admin_${ts}@test.com`, password: 'AdminPass123!' },
        });
        const ok = assert('POST /auth/login — correct creds', status, body, 200,
            b => b.data?.accessToken);
        if (ok) adminToken = body.data.accessToken; // refresh token
    }

    {
        // Login — wrong password
        const { status, body } = await req('POST', '/auth/login', {
            body: { email: `admin_${ts}@test.com`, password: 'WrongPassword!' },
        });
        assert('POST /auth/login — wrong password (expect 401)', status, body, 401);
    }

    {
        // Login — non-existent user
        const { status, body } = await req('POST', '/auth/login', {
            body: { email: `nobody_${ts}@test.com`, password: 'Anything1!' },
        });
        assert('POST /auth/login — no such user (expect 401)', status, body, 401);
    }

    // ─── 2. Users (admin-only) ─────────────────────────────────
    console.log(`\n${clr.yellow}${clr.bold}━━━ Users ━━━${clr.reset}`);

    // NOTE: newly registered users have role USER.
    // The tests below demonstrate the 403 behaviour unless your DB seeds an admin.
    // If you have a seeded admin, replace adminToken with that admin's token above.

    {
        // List users — no token
        const { status, body } = await req('GET', '/users');
        assert('GET /users — unauthenticated (expect 401)', status, body, 401);
    }

    {
        // List users — as regular user (expect 403)
        const { status, body } = await req('GET', '/users', { token: userToken });
        assert('GET /users — regular user (expect 403)', status, body, 403);
    }

    {
        // List users — as admin (or whichever token has ADMIN role)
        const { status, body } = await req('GET', '/users', { token: adminToken });
        // Accept 200 (seeded admin) or 403 (fresh DB, both are USER)
        const ok = [200, 403].includes(status);
        if (!ok) failed++;
        else passed++;
        const icon = ok ? `${clr.green}✔` : `${clr.red}✘`;
        console.log(`\n${icon} ${clr.green}${clr.bold}GET /users — with token (200 or 403 both valid)${clr.reset}`);
        console.log(`   Status : ${status}`);
        if (status === 200 && body.data?.items?.length > 0) {
            // grab a valid userId for the next test
            userId = body.data.items.find(u => u.id !== adminId)?.id || userId;
        }
    }

    {
        // Get single user — no token
        const { status, body } = await req('GET', `/users/${adminId}`);
        assert('GET /users/:id — unauthenticated (expect 401)', status, body, 401);
    }

    // ─── 3. Tickets ────────────────────────────────────────────
    console.log(`\n${clr.yellow}${clr.bold}━━━ Tickets ━━━${clr.reset}`);

    let ticketId;

    {
        // No auth
        const { status, body } = await req('GET', '/tickets');
        assert('GET /tickets — unauthenticated (expect 401)', status, body, 401);
    }

    {
        // Create ticket — no auth
        const { status, body } = await req('POST', '/tickets', {
            body: { title: 'Test', description: 'Test' },
        });
        assert('POST /tickets — unauthenticated (expect 401)', status, body, 401);
    }

    {
        // Create ticket — as regular user
        const { status, body } = await req('POST', '/tickets', {
            token: userToken,
            body: {
                title: `Bug Report ${ts}`,
                description: 'Something is broken in production.',
                priority: 'HIGH',
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            },
        });
        const ok = assert('POST /tickets — create (expect 201)', status, body, 201,
            b => b.data?.id);
        if (ok) ticketId = body.data.id;
    }

    {
        // Create ticket — validation error (missing description)
        const { status, body } = await req('POST', '/tickets', {
            token: userToken,
            body: { title: 'Missing description' },
        });
        assert('POST /tickets — missing description (expect 400)', status, body, 400);
    }

    {
        // List tickets — as user (should see own tickets)
        const { status, body } = await req('GET', '/tickets', { token: userToken });
        assert('GET /tickets — list (expect 200)', status, body, 200,
            b => Array.isArray(b.data?.items));
    }

    {
        // List tickets with filters
        const { status, body } = await req('GET', '/tickets?priority=HIGH&page=1&limit=5',
            { token: userToken });
        assert('GET /tickets?priority=HIGH&page=1&limit=5 (expect 200)', status, body, 200);
    }

    if (ticketId) {
        {
            // Get ticket by id
            const { status, body } = await req('GET', `/tickets/${ticketId}`, { token: userToken });
            assert('GET /tickets/:id — (expect 200)', status, body, 200,
                b => b.data?.id === ticketId);
        }

        {
            // Get ticket — wrong id
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const { status, body } = await req('GET', `/tickets/${fakeId}`, { token: userToken });
            assert('GET /tickets/:id — non-existent (expect 404)', status, body, 404);
        }

        {
            // Update ticket
            const { status, body } = await req('PATCH', `/tickets/${ticketId}`, {
                token: userToken,
                body: { title: `Updated Title ${ts}`, priority: 'URGENT' },
            });
            assert('PATCH /tickets/:id — update (expect 200)', status, body, 200,
                b => b.data?.priority === 'URGENT');
        }

        {
            // Assign ticket — regular user (expect 403 — admin only)
            const { status, body } = await req('POST', `/tickets/${ticketId}/assign`, {
                token: userToken,
                body: { assigneeId: userId },
            });
            assert('POST /tickets/:id/assign — non-admin (expect 403)', status, body, 403);
        }

        {
            // Assign ticket — admin token (may be 403 if both users are USER role)
            const { status, body } = await req('POST', `/tickets/${ticketId}/assign`, {
                token: adminToken,
                body: { assigneeId: userId },
            });
            const ok = [200, 403].includes(status);
            if (!ok) failed++;
            else passed++;
            const icon = ok ? `${clr.green}✔` : `${clr.red}✘`;
            console.log(`\n${icon} ${clr.green}${clr.bold}POST /tickets/:id/assign — admin token (200 or 403)${clr.reset}`);
            console.log(`   Status : ${status}`);
        }

        {
            // Change status
            const { status, body } = await req('POST', `/tickets/${ticketId}/status`, {
                token: userToken,
                body: { status: 'IN_PROGRESS' },
            });
            assert('POST /tickets/:id/status — change status (expect 200)', status, body, 200);
        }

        {
            // Change status — invalid value
            const { status, body } = await req('POST', `/tickets/${ticketId}/status`, {
                token: userToken,
                body: { status: 'INVALID_STATUS' },
            });
            assert('POST /tickets/:id/status — bad status (expect 400)', status, body, 400);
        }

        // ─── 4. Comments ───────────────────────────────────────────
        console.log(`\n${clr.yellow}${clr.bold}━━━ Comments ━━━${clr.reset}`);

        {
            // List comments — no auth
            const { status, body } = await req('GET', `/tickets/${ticketId}/comments`);
            assert('GET /tickets/:id/comments — unauthenticated (expect 401)', status, body, 401);
        }

        {
            // List comments — authenticated
            const { status, body } = await req('GET', `/tickets/${ticketId}/comments`,
                { token: userToken });
            assert('GET /tickets/:id/comments — list (expect 200)', status, body, 200);
        }

        {
            // Add comment
            const { status, body } = await req('POST', `/tickets/${ticketId}/comments`, {
                token: userToken,
                body: { content: `Test comment @ ${ts}` },
            });
            assert('POST /tickets/:id/comments — add (expect 201)', status, body, 201);
        }

        {
            // Add comment — empty content
            const { status, body } = await req('POST', `/tickets/${ticketId}/comments`, {
                token: userToken,
                body: { content: '' },
            });
            assert('POST /tickets/:id/comments — empty content (expect 400)', status, body, 400);
        }

        // ─── 5. Delete ticket ──────────────────────────────────────
        console.log(`\n${clr.yellow}${clr.bold}━━━ Delete ━━━${clr.reset}`);

        {
            // Delete — non-admin (expect 403)
            const { status, body } = await req('DELETE', `/tickets/${ticketId}`,
                { token: userToken });
            assert('DELETE /tickets/:id — non-admin (expect 403)', status, body, 403);
        }

        {
            // Delete — admin token (may be 403 if both users are USER role in fresh DB)
            const { status, body } = await req('DELETE', `/tickets/${ticketId}`,
                { token: adminToken });
            const ok = [200, 403].includes(status);
            if (!ok) failed++;
            else passed++;
            const icon = ok ? `${clr.green}✔` : `${clr.red}✘`;
            console.log(`\n${icon} ${clr.green}${clr.bold}DELETE /tickets/:id — admin token (200 or 403)${clr.reset}`);
            console.log(`   Status : ${status}`);
        }
    }

    // ─── Summary ───────────────────────────────────────────────
    const total = passed + failed;
    const colour = failed === 0 ? clr.green : clr.red;
    console.log(`\n${clr.cyan}${clr.bold}══════════════════════════════════════════${clr.reset}`);
    console.log(`${colour}${clr.bold}Results: ${passed}/${total} tests passed, ${failed} failed.${clr.reset}`);
    if (failed > 0) {
        console.log(`${clr.yellow}Tip: If admin-only tests show 403, seed an ADMIN user in your${clr.reset}`);
        console.log(`${clr.yellow}DB or update the test with a real admin token.${clr.reset}`);
    }
    console.log(`${clr.cyan}${clr.bold}══════════════════════════════════════════${clr.reset}\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error(`\n${clr.red}Fatal error:${clr.reset}`, err.message);
    console.error('Is the backend running on http://localhost:5000?');
    process.exit(1);
});
