import Agentai from '@/components/Agentai'
import { getCurentUser } from '@/lib/actions/auth.actions'
import React from 'react'

const page =  async () => {

  const user = await getCurentUser();

  return (
    <>
    <h3>Interview Generation</h3>
        <Agentai  userName={user?.name} userId={user?.id}  type="generate" />
    </>
  )
}

export default page