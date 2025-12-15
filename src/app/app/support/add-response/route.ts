import { addTicketResponse } from '../actions'

export async function POST(request: Request) {
  const formData = await request.formData()
  const result = await addTicketResponse(formData)

  return Response.json(result)
}