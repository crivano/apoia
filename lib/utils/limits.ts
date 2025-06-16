import { envNumber } from "./env"

export function dailyLimits(court_id: number): { user_usage_count: number, user_usage_cost: number, court_usage_count: number, court_usage_cost: number } {
    const user_usage_count = envNumber(`TRIBUNAL_${court_id}_USER_DAILY_USAGE_COUNT`)
    const user_usage_cost = envNumber(`TRIBUNAL_${court_id}_USER_DAILY_USAGE_COST`)
    const court_usage_count = envNumber(`TRIBUNAL_${court_id}_DAILY_USAGE_COUNT`)
    const court_usage_cost = envNumber(`TRIBUNAL_${court_id}_DAILY_USAGE_COST`)
    return {
        user_usage_count,
        user_usage_cost,
        court_usage_count,
        court_usage_cost
    }
}

