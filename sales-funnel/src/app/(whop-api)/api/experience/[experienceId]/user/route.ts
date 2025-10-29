import { verifyUserToken } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { type WhopAccess, type WhopUser, whop } from '~/lib/whop'

function getCorsHeaders(origin?: string | null) {
	const allowedOrigins = ['https://www.whop.com', 'https://whop.com']
	const isAllowed = origin && allowedOrigins.some(allowed => origin.startsWith(allowed))
	
	return {
		'Access-Control-Allow-Origin': isAllowed ? origin : '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true',
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: getCorsHeaders(),
	})
}

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ experienceId: string }> },
) {
	const { experienceId } = await params
	if (!experienceId) return NextResponse.json({ error: 'Missing params' }, { status: 400, headers: getCorsHeaders(req.headers.get('origin')) })

	const { userId } = await verifyUserToken(req.headers)
	if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(req.headers.get('origin')) })

	try {
		const [user, access] = await Promise.all([
			whop.users.getUser({ userId }),
			whop.access.checkIfUserHasAccessToExperience({ experienceId, userId }),
		])
		return NextResponse.json<{
			user: WhopUser
			access: WhopAccess
		}>({ user, access }, {
			headers: getCorsHeaders(req.headers.get('origin')),
		})
	} catch (error) {
		console.error('Failed to fetch user:', error)
		return NextResponse.json({ error: 'Failed to fetch' }, { status: 500, headers: getCorsHeaders(req.headers.get('origin')) })
	}
}
