import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuthStore } from "../../stores/authState"

export const Route = createFileRoute("/callback/")({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      token: search.token as string | undefined, // access token
      rt: search.rt as string | undefined, // refresh token
      tokenExp: search.tokenExp ? Number(search.tokenExp) : undefined, // access token ttl seconds
      rtExp: search.rtExp ? Number(search.rtExp) : undefined // refresh token ttl seconds
    }
  }
})

function RouteComponent() {
  const navigate = useNavigate()
  const { token, rt, tokenExp, rtExp } = Route.useSearch()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    if (token) {
      setAuth({
        accessToken: token,
        refreshToken: rt,
        expiresIn: tokenExp,
        refreshExpiresIn: rtExp
      })
      navigate({ to: "/account", replace: true })
    } else {
      navigate({ to: "/", replace: true })
    }
  }, [token, rt, tokenExp, rtExp, navigate, setAuth])

  return null
}
