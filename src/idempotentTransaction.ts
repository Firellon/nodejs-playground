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
    let client: Client = await pool.connect();
    try {
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
                `SELECT death_cause
                FROM player_requests
                WHERE idempotency_key = $1 AND player_id = $2 AND session_id = $3`,
                [input.idempotencyKey, input.playerId, input.sessionId]
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
        if (playerResult.rows.length === 0) {
            // Something went wrong? Shouldn't happen
            await client.query('ROLLBACK');
            return { statusCode: 404};
        }

        const response = { statusCode: 201, deathCount: playerResult.rows[0].death_count };

        await client.query(
            `UPDATE player_requests
            SET response = $1
            HERE idempotency_key = $2 AND player_id = $3 AND session_id = $4
            RETURNING death_count`,
            [response, input.idempotencyKey, input.playerId, input.sessionId]
        );

        await client.query('COMMIT');
        return response;
    } catch (error: any) {
        console.log(`Record Death error: ${error}`)
        await client.query('ROLLBACK');
        return { statusCode: 403};
    } finally {
        await client.end();
    }
}