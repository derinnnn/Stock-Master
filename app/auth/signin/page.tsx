import { Suspense } from "react"
import { SignInForm } from "./signin-form"

export default function SignIn() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
