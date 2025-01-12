'use server'

import { verifySession } from "../_lib/session"

export async function signup() {
  await verifySession()
}

