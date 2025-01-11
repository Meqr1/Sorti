'use client'
import { signup } from "@/pages/auth/actions";
import { useActionState } from "react";

export default function Signup() {
  const [state, action, pending] = useActionState(signup)

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <form action={action} className="flex gap-3 flex-col w-[400px]">
        <div className="flex-col flex">
          <label className="m-0">Name</label>
          <input name="name" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="John Doe" />
          {state?.errors?.name && <p className="text-red-400">{state.errors.name}</p>}
        </div>
        <div className="flex-col flex">
          <label className="m-0">Name</label>
          <input name="email" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="john@example.com" />
          {state?.errors?.email && <p className="text-red-400">{state.errors.email}</p>}
        </div>
        <div className="flex flex-col">
          <label className="m-0">Name</label>
          <input name="password" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="Password" />
          {state?.errors?.password &&
            (
              <>
                <p className="text-red-400">password must:</p>
                <ul className="list-disc">
                  {state.errors.password
                    .filter(Boolean)               // Filter out any empty strings
                    .map((requirement, index) => ( // Map each item to a list element
                      <li key={index} className="text-red-400">{requirement.trim()}</li> // Trim whitespace and render as <li>
                    ))
                  }
                </ul>
              </>
            )
          }
        </div>

        <button disabled={pending} className="border border-white bg-white text-black rounded-xl p-2 px-5 text-center">
        {pending ? 'Submitting... ' : 'Sign up' }
        </button>
      </form>
    </div>
  )
}
