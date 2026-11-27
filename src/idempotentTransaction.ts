import { Client, Pool } from "pg";

// CREATE TABLE players (
//     id UUID PRIMARY KEY,
//     death_count INTEGER NOT NULL DEFAULT 0
// );

// CREATE TABLE player_requests (
//     idempotency_key TEXT PRIMARY KEY,
//     player_id UUID NOT NULL,
//     session_id UUID NOT NULL,
//     death_cause TEXT NOT NULL,
//     response JSONB
// );

export interface DeathRequest {
    playerId: string;
    sessionId: string;
    deathCause: string;
    idempotencyKey: string;
}

export type RecordDeathOutput = {
    statusCode: number
    deathCount?: number
}

export async function recordDeath(
    pool: Pool,
    input: DeathRequest
): Promise<RecordDeathOutput> {
    var client = await pool.connect();

    const playerExistsResult = await client.query(
        `SELECT id from players WHERE id = $1`,
        [input.playerId]
    );
    if (playerExistsResult.rows.length === 0) {
        // Player does not exist.
        return { statusCode: 404};
    }
        
    await client.query('BEGIN');
    const result = await client.query(
        `INSERT INTO player_requests (idempotency_key, player_id, session_id, death_cause)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING idempotency_key`,
        [input.idempotencyKey, input.playerId, input.sessionId, input.deathCause]
    );

    if (result.rows.length === 0) {
        // The event already exists.
        const existingRequest = await client.query(
            `SELECT session_id
            FROM player_requests
            WHERE idempotency_key = $1`,
            [input.idempotencyKey]
        );

        if (existingRequest.rows[0].death_cause !== input.deathCause) {
            // Conflicting data
            await client.query('ROLLBACK');
            return { statusCode: 409};
        }

        await client.query('COMMIT');
        return { statusCode: 200 }; // Legitimate retry
    }

    // Newly inserted event
    const playerResult = await client.query(
        `UPDATE players
        SET death_count = death_count + 1
        WHERE id = $1
        RETURNING death_count`,
        [input.playerId]
    );
    if (playerResult.rows[0].length === 0) {
        // Something went wrong? Shouldn't happen
        await client.query('ROLLBACK');
        return { statusCode: 404};
    }

    await client.query('COMMIT');
    return { statusCode: 201, deathCount: playerResult.rows[0].death_count };
}