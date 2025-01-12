'use client'
import { useActionState } from "react";
import { login } from "./action";

export default function Signup() {
  const [, action, pending] = useActionState(login, null)

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <form action={action} className="flex gap-3 flex-col w-[400px]">
        <div className="flex-col flex">
          <label className="m-0">Email</label>
          <input name="email" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="john@example.com" />
        </div>
        <div className="flex flex-col">
          <label className="m-0">Password</label>
          <input name="password" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="Password" />
        </div>

        <button disabled={pending} className="border border-white bg-white text-black rounded-xl p-2 px-5 text-center">
        {pending ? 'Submitting... ' : 'Sign up' }
        </button>
      </form>
    </div>
  )
}
