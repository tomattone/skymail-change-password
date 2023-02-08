import type { NextApiRequest, NextApiResponse } from 'next'

import jsonwebtoken from 'jsonwebtoken'

const {
  SKYMAIL_PRIVATE_KEY,
  SKYMAIL_USERNAME,
  SKYMAIL_PASSWORD,
  EMAIL_PASSWORD,
} = process.env

async function getToken() {
  let data: Response = await fetch('https://api.skymail.net.br/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: SKYMAIL_USERNAME,
      password: SKYMAIL_PASSWORD,
    }),
  })
  const JsonToken = await data.json()
  const jti = JsonToken.data.jti

  var token = jsonwebtoken.sign({ jti }, SKYMAIL_PRIVATE_KEY || '', {
    algorithm: 'HS256',
  })

  return token
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken()

  await fetch(
    'https://api.skymail.net.br/v1/mailbox/naoresponda@vpereck.com.br',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: 'Teste123!',
      }),
    }
  )

  const data = await fetch(
    'https://api.skymail.net.br/v1/mailbox/naoresponda@vpereck.com.br',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: EMAIL_PASSWORD,
      }),
    }
  )

  const json = await data.json()

  if (json.success) {
    res.status(200).json({
      status: json.success,
      message: 'Senha alterada com sucesso em ' + new Date(),
    })
  } else {
    res.status(500).json({ status: json.success, message: json.message })
  }
}
